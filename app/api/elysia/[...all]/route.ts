import { Elysia, t } from "elysia";
import type { TSchema } from "@sinclair/typebox";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { executeInSandbox } from "@/lib/execution/sandbox";

const NullableString = t.Union([t.String(), t.Null()]);

const ChallengeSummary = t.Object({
  id: t.String(),
  slug: t.String(),
  title: t.String(),
  description: NullableString,
  language: t.String(),
  bugTier: t.String(),
  docsLink: NullableString,
});

const SkillSummary = t.Object({
  id: t.String(),
  name: t.String(),
  description: NullableString,
  category: t.String(),
  maxTier: t.Number(),
  isPassive: t.Boolean(),
});

const ApiError = t.Object({
  code: t.String(),
  message: t.String(),
});

const ApiSuccess = <T extends TSchema>(data: T) =>
  t.Object({
    data,
    error: t.Null(),
  });

const ApiFailure = t.Object({
  data: t.Null(),
  error: ApiError,
});

const ExecuteTestCase = t.Object({
  id: t.String(),
  input: t.String(),
  expectedOutput: t.String(),
  hidden: t.Optional(t.Boolean()),
});

const ExecuteRequest = t.Object({
  language: t.Union([
    t.Literal("javascript"),
    t.Literal("typescript"),
    t.Literal("python"),
    t.Literal("c"),
    t.Literal("cpp"),
    t.Literal("java"),
    t.Literal("go"),
  ]),
  code: t.String(),
  tests: t.Array(ExecuteTestCase),
  timeoutMs: t.Optional(t.Number()),
});

const ExecuteResult = t.Object({
  status: t.String(),
  tests: t.Array(
    t.Object({
      id: t.String(),
      passed: t.Boolean(),
      actualOutput: NullableString,
      expectedOutput: NullableString,
      durationMs: t.Number(),
      hidden: t.Boolean(),
    }),
  ),
  stdout: t.String(),
  stderr: t.String(),
  durationMs: t.Number(),
});

const resolveErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "The system destabilized.";
};

export const app = new Elysia({ prefix: "/api/elysia" })
  .onError(({ code, error, set }) => {
    const status = code === "NOT_FOUND" ? 404 : 500;
    set.status = status;

    return {
      data: null,
      error: {
        code: code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_ERROR",
        message: resolveErrorMessage(error),
      },
    };
  })
  .get(
    "/health",
    () => ({
      data: { status: "ok" },
      error: null,
    }),
    {
      response: {
        200: ApiSuccess(t.Object({ status: t.String() })),
        500: ApiFailure,
      },
    },
  )
  .get(
    "/challenges",
    async () => {
      const rows = await db
        .select({
          id: schema.challenges.id,
          slug: schema.challenges.slug,
          title: schema.challenges.title,
          description: schema.challenges.description,
          language: schema.challenges.language,
          bugTier: schema.challenges.bugTier,
          docsLink: schema.challenges.codexLink,
        })
        .from(schema.challenges);

      return {
        data: rows,
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(t.Array(ChallengeSummary)),
        500: ApiFailure,
      },
    },
  )
  .get(
    "/challenges/:slug",
    async ({ params, set }) => {
      const [row] = await db
        .select({
          id: schema.challenges.id,
          slug: schema.challenges.slug,
          title: schema.challenges.title,
          description: schema.challenges.description,
          language: schema.challenges.language,
          bugTier: schema.challenges.bugTier,
          starterCode: schema.challenges.starterCode,
          constraints: schema.challenges.constraints,
          rewards: schema.challenges.rewards,
          serverHealthDrainRate: schema.challenges.serverHealthDrainRate,
          docsLink: schema.challenges.codexLink,
        })
        .from(schema.challenges)
        .where(eq(schema.challenges.slug, params.slug))
        .limit(1);

      if (!row) {
        set.status = 404;
        return {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Challenge not found.",
          },
        };
      }

      return {
        data: row,
        error: null,
      };
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      response: {
        200: ApiSuccess(
          t.Object({
            id: t.String(),
            slug: t.String(),
            title: t.String(),
            description: NullableString,
            language: t.String(),
            bugTier: t.String(),
            starterCode: t.String(),
            constraints: t.Unknown(),
            rewards: t.Unknown(),
            serverHealthDrainRate: t.Number(),
            docsLink: NullableString,
          }),
        ),
        404: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .get(
    "/skills",
    async () => {
      const rows = await db
        .select({
          id: schema.skills.id,
          name: schema.skills.name,
          description: schema.skills.description,
          category: schema.skills.category,
          maxTier: schema.skills.maxTier,
          isPassive: schema.skills.isPassive,
        })
        .from(schema.skills);

      return {
        data: rows,
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(t.Array(SkillSummary)),
        500: ApiFailure,
      },
    },
  )
  .post(
    "/execute",
    async ({ body }) => {
      const result = await executeInSandbox(body);
      const hiddenMap = new Map(body.tests.map((test) => [test.id, test.hidden ?? false]));

      return {
        data: {
          ...result,
          tests: result.tests.map((test) => {
            const hidden = hiddenMap.get(test.id) ?? false;
            return {
              id: test.id,
              passed: test.passed,
              actualOutput: hidden ? null : test.actualOutput,
              expectedOutput: hidden ? null : test.expectedOutput,
              durationMs: test.durationMs,
              hidden,
            };
          }),
        },
        error: null,
      };
    },
    {
      body: ExecuteRequest,
      response: {
        200: ApiSuccess(ExecuteResult),
        500: ApiFailure,
      },
    },
  );

export type App = typeof app;

export const runtime = "nodejs";

export const GET = app.handle;
export const POST = app.handle;
export const PATCH = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
