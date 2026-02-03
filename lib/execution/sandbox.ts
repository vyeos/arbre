import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { spawn } from "child_process";
import { Sandbox } from "@e2b/code-interpreter";

import type {
  ExecutionLanguage,
  ExecutionRequest,
  ExecutionResult,
  ExecutionStatus,
  ExecutionTestCase,
  TestResult,
} from "./types";

const DEFAULT_TIMEOUT_MS = 4000;
const DEFAULT_MEMORY_LIMIT = "512m";
const DEFAULT_CPU_LIMIT = "1";

const RUNNER_IMAGE = process.env.SANDBOX_RUNNER_IMAGE ?? "arbre-runner:latest";
const E2B_TEMPLATE = process.env.E2B_TEMPLATE ?? "base";
const E2B_TIMEOUT_MS = Number(process.env.E2B_SANDBOX_TIMEOUT_MS ?? "60000");
const E2B_WORKDIR = process.env.E2B_WORKDIR ?? "/workspace";
const E2B_SUPPORTED_LANGUAGES: ExecutionLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "c",
  "cpp",
  "java",
  "go",
];

const normalizeOutput = (value: string) => value.replace(/\r\n/g, "\n").trimEnd();

const buildTempDir = async () => mkdtemp(path.join(tmpdir(), "arbre-run-"));

const buildFileName = (language: ExecutionLanguage) => {
  switch (language) {
    case "javascript":
      return "main.js";
    case "typescript":
      return "main.ts";
    case "python":
      return "main.py";
    case "c":
      return "main.c";
    case "cpp":
      return "main.cpp";
    case "java":
      return "Main.java";
    case "go":
      return "main.go";
    default:
      return "main.txt";
  }
};

const buildCommands = (language: ExecutionLanguage, fileName: string) => {
  switch (language) {
    case "javascript":
      return {
        compile: null,
        run: `node ${fileName}`,
      };
    case "typescript":
      return {
        compile: null,
        run: `ts-node ${fileName}`,
      };
    case "python":
      return {
        compile: null,
        run: `python3 ${fileName}`,
      };
    case "c":
      return {
        compile: `gcc ${fileName} -O2 -std=c11 -o app`,
        run: `./app`,
      };
    case "cpp":
      return {
        compile: `g++ ${fileName} -O2 -std=c++17 -o app`,
        run: `./app`,
      };
    case "java":
      return {
        compile: `javac ${fileName}`,
        run: `java Main`,
      };
    case "go":
      return {
        compile: `go build -o app ${fileName}`,
        run: `./app`,
      };
  }
};

const buildStdinCommand = (command: string, stdin?: string) => {
  if (!stdin) return command;
  const encoded = Buffer.from(stdin, "utf8").toString("base64");
  return `bash -lc "printf %s ${encoded} | base64 -d | ${command}"`;
};

const runE2BCommand = async ({
  sandbox,
  command,
  stdin,
}: {
  sandbox: Sandbox;
  command: string;
  stdin?: string;
}) => {
  const result = await sandbox.commands.run(buildStdinCommand(command, stdin));
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: typeof result.exitCode === "number" ? result.exitCode : null,
    timedOut: false,
  };
};

const runLocalCommand = async ({
  workdir,
  command,
  stdin,
  timeoutMs,
}: {
  workdir: string;
  command: string;
  stdin?: string;
  timeoutMs: number;
}) => {
  return new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
  }>((resolve) => {
    const child = spawn("bash", ["-lc", command], { stdio: "pipe", cwd: workdir });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.on("error", (error) => {
      clearTimeout(timeout);
      const message = error instanceof Error ? error.message : "Local spawn failed.";
      resolve({ stdout, stderr: message, exitCode: null, timedOut: false });
    });

    child.on("close", (exitCode) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, exitCode, timedOut });
    });
  });
};

const runDockerCommand = async ({
  workdir,
  command,
  stdin,
  timeoutMs,
}: {
  workdir: string;
  command: string;
  stdin?: string;
  timeoutMs: number;
}) => {
  const allowLocal =
    process.env.SANDBOX_ALLOW_LOCAL === "true" || process.env.NODE_ENV !== "production";
  const args = [
    "run",
    "--rm",
    "--network",
    "none",
    "--cpus",
    DEFAULT_CPU_LIMIT,
    "--memory",
    DEFAULT_MEMORY_LIMIT,
    "--pids-limit",
    "256",
    "--security-opt",
    "no-new-privileges",
    "--cap-drop",
    "all",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,nodev",
    "-v",
    `${workdir}:/workspace:rw`,
    "-w",
    "/workspace",
    RUNNER_IMAGE,
    "bash",
    "-lc",
    command,
  ];

  return new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
  }>((resolve) => {
    const child = spawn("docker", args, { stdio: "pipe" });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.on("error", async (error) => {
      clearTimeout(timeout);
      if (allowLocal) {
        const localResult = await runLocalCommand({ workdir, command, stdin, timeoutMs });
        resolve(localResult);
        return;
      }
      const message = error instanceof Error ? error.message : "Docker spawn failed.";
      resolve({ stdout, stderr: message, exitCode: null, timedOut: false });
    });

    child.on("close", async (exitCode) => {
      clearTimeout(timeout);
      if (exitCode === null && allowLocal) {
        const localResult = await runLocalCommand({ workdir, command, stdin, timeoutMs });
        resolve(localResult);
        return;
      }
      resolve({ stdout, stderr, exitCode, timedOut });
    });
  });
};

const deriveStatus = (
  compileExitCode: number | null,
  compileTimedOut: boolean,
  runExitCode: number | null,
  runTimedOut: boolean,
): ExecutionStatus => {
  if (compileTimedOut || runTimedOut) return "timeout";
  if (compileExitCode && compileExitCode !== 0) return "compile_error";
  if (runExitCode && runExitCode !== 0) return "runtime_error";
  return "passed";
};

const runTestCase = async (
  workdir: string,
  runCommand: string,
  test: ExecutionTestCase,
  timeoutMs: number,
): Promise<TestResult & { stderr: string; exitCode: number | null; timedOut: boolean }> => {
  const start = Date.now();
  const { stdout, stderr, exitCode, timedOut } = await runDockerCommand({
    workdir,
    command: runCommand,
    stdin: test.input,
    timeoutMs,
  });
  const durationMs = Date.now() - start;

  return {
    id: test.id,
    passed:
      !timedOut &&
      exitCode === 0 &&
      normalizeOutput(stdout) === normalizeOutput(test.expectedOutput),
    actualOutput: normalizeOutput(stdout),
    expectedOutput: normalizeOutput(test.expectedOutput),
    durationMs,
    stderr: normalizeOutput(stderr),
    exitCode,
    timedOut,
  };
};

export const executeInSandbox = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  if (process.env.E2B_API_KEY) {
    return executeInE2B(request);
  }

  const workdir = await buildTempDir();
  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fileName = buildFileName(request.language);
  const commands = buildCommands(request.language, fileName);

  const summary = {
    status: "internal_error" as ExecutionStatus,
    tests: [] as TestResult[],
    stdout: "",
    stderr: "",
    durationMs: 0,
  };

  try {
    await writeFile(path.join(workdir, fileName), request.code, "utf8");

    let compileExitCode: number | null = 0;
    let compileTimedOut = false;
    let compileStdout = "";
    let compileStderr = "";

    if (commands.compile) {
      const compileResult = await runDockerCommand({
        workdir,
        command: commands.compile,
        timeoutMs,
      });
      compileExitCode = compileResult.exitCode;
      compileTimedOut = compileResult.timedOut;
      compileStdout = compileResult.stdout;
      compileStderr = compileResult.stderr;
    }

    if (compileTimedOut || (compileExitCode && compileExitCode !== 0)) {
      return {
        status: compileTimedOut ? "timeout" : "compile_error",
        tests: [],
        stdout: normalizeOutput(compileStdout),
        stderr: normalizeOutput(compileStderr),
        durationMs: 0,
      };
    }

    const results: TestResult[] = [];
    let runStdout = "";
    let runStderr = "";
    let runExitCode: number | null = 0;
    let runTimedOut = false;

    for (const test of request.tests) {
      const testResult = await runTestCase(workdir, commands.run, test, timeoutMs);
      runStdout = testResult.actualOutput;
      runStderr = testResult.stderr;
      runExitCode = testResult.exitCode;
      runTimedOut = testResult.timedOut;
      results.push({
        id: testResult.id,
        passed: testResult.passed,
        actualOutput: testResult.actualOutput,
        expectedOutput: testResult.expectedOutput,
        durationMs: testResult.durationMs,
      });

      if (testResult.timedOut) {
        break;
      }
    }

    const status = deriveStatus(compileExitCode, compileTimedOut, runExitCode, runTimedOut);
    const finalStatus =
      status === "passed" && results.some((result) => !result.passed) ? "failed" : status;

    return {
      status: finalStatus,
      tests: results,
      stdout: normalizeOutput(runStdout),
      stderr: normalizeOutput(runStderr),
      durationMs: results.reduce((total, result) => total + result.durationMs, 0),
    };
  } catch (error) {
    return {
      ...summary,
      stderr: normalizeOutput(String(error)),
      stdout: "",
      durationMs: 0,
    };
  } finally {
    await rm(workdir, { recursive: true, force: true }).catch(() => undefined);
  }
};

const executeInE2B = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fileName = buildFileName(request.language);
  const commands = buildCommands(request.language, fileName);

  const summary = {
    status: "internal_error" as ExecutionStatus,
    tests: [] as TestResult[],
    stdout: "",
    stderr: "",
    durationMs: 0,
  };

  if (!E2B_SUPPORTED_LANGUAGES.includes(request.language)) {
    return {
      ...summary,
      status: "compile_error",
      stderr: "Unsupported language in E2B template.",
    };
  }

  const sandbox = await Sandbox.create(E2B_TEMPLATE, {
    timeoutMs: Math.max(timeoutMs * 2, E2B_TIMEOUT_MS),
  });

  try {
    const workdir = E2B_WORKDIR;
    await sandbox.files.write(`${workdir}/${fileName}`, request.code);

    let compileExitCode: number | null = 0;
    let compileTimedOut = false;
    let compileStdout = "";
    let compileStderr = "";

    if (commands.compile) {
      const compileResult = await runE2BCommand({
        sandbox,
        command: `cd ${workdir} && ${commands.compile}`,
      });
      compileExitCode = compileResult.exitCode;
      compileTimedOut = compileResult.timedOut;
      compileStdout = compileResult.stdout;
      compileStderr = compileResult.stderr;
    }

    if (compileTimedOut || (compileExitCode && compileExitCode !== 0)) {
      return {
        status: compileTimedOut ? "timeout" : "compile_error",
        tests: [],
        stdout: normalizeOutput(compileStdout),
        stderr: normalizeOutput(compileStderr),
        durationMs: 0,
      };
    }

    const results: TestResult[] = [];
    let runStdout = "";
    let runStderr = "";
    let runExitCode: number | null = 0;
    let runTimedOut = false;

    for (const test of request.tests) {
      const testResult = await runE2BCommand({
        sandbox,
        command: `cd ${workdir} && ${commands.run}`,
        stdin: test.input,
      });
      const durationMs = 0;
      runStdout = testResult.stdout;
      runStderr = testResult.stderr;
      runExitCode = testResult.exitCode;
      runTimedOut = testResult.timedOut;
      results.push({
        id: test.id,
        passed:
          !runTimedOut &&
          runExitCode === 0 &&
          normalizeOutput(runStdout) === normalizeOutput(test.expectedOutput),
        actualOutput: normalizeOutput(runStdout),
        expectedOutput: normalizeOutput(test.expectedOutput),
        durationMs,
      });

      if (runTimedOut) {
        break;
      }
    }

    const status = deriveStatus(compileExitCode, compileTimedOut, runExitCode, runTimedOut);
    const finalStatus =
      status === "passed" && results.some((result) => !result.passed) ? "failed" : status;

    return {
      status: finalStatus,
      tests: results,
      stdout: normalizeOutput(runStdout),
      stderr: normalizeOutput(runStderr),
      durationMs: results.reduce((total, result) => total + result.durationMs, 0),
    };
  } catch (error) {
    return {
      ...summary,
      stderr: normalizeOutput(String(error)),
      stdout: "",
      durationMs: 0,
    };
  } finally {
    await sandbox.kill().catch(() => undefined);
  }
};
