export type ExecutionLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "c"
  | "cpp"
  | "java"
  | "go";

export type ExecutionTestCase = {
  id: string;
  input: string;
  expectedOutput: string;
  hidden?: boolean;
};

export type TestResult = {
  id: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  durationMs: number;
};

export type ExecutionStatus =
  | "passed"
  | "failed"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "internal_error";

export type ExecutionResult = {
  status: ExecutionStatus;
  tests: TestResult[];
  stdout: string;
  stderr: string;
  durationMs: number;
};

export type ExecutionApiTestResult = {
  id: string;
  passed: boolean;
  actualOutput: string | null;
  expectedOutput: string | null;
  durationMs: number;
  hidden: boolean;
};

export type ExecutionApiResult = {
  status: ExecutionStatus;
  tests: ExecutionApiTestResult[];
  stdout: string;
  stderr: string;
  durationMs: number;
};

export type ExecutionApiResponse = {
  data: ExecutionApiResult | null;
  error: { code: string; message: string } | null;
};

export type ExecutionRequest = {
  language: ExecutionLanguage;
  code: string;
  tests: ExecutionTestCase[];
  timeoutMs?: number;
};
