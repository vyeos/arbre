import { Elysia, t } from "elysia";
import type { TSchema } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { executeInSandbox } from "@/lib/execution/sandbox";
import { getCurrentUser } from "@/lib/auth-session";
import {
  applySkillEffects,
  canUnlockSkill,
  getSkillCost,
  getSkillDefinition,
} from "@/lib/skills/engine";
import { skillCatalog } from "@/lib/skills/catalog";

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

const SkillPrerequisite = t.Object({
  id: t.String(),
  tier: t.Number(),
});

const SkillEffect = t.Object({
  type: t.String(),
  value: t.Number(),
  mode: t.Union([t.Literal("add"), t.Literal("multiply")]),
  perTier: t.Optional(t.Boolean()),
});

const SkillCatalogEntry = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  branch: t.String(),
  maxTier: t.Number(),
  costs: t.Array(t.Number()),
  prerequisites: t.Optional(t.Array(SkillPrerequisite)),
  effects: t.Array(SkillEffect),
  isPassive: t.Boolean(),
});

const SkillUnlockEntry = t.Object({
  id: t.String(),
  tier: t.Number(),
});

const SkillEffectsSummary = t.Object({
  health_drain_multiplier: t.Number(),
  stability_buffer: t.Number(),
  log_intel: t.Number(),
  reward_multiplier: t.Number(),
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
  .get(
    "/skills/catalog",
    () => ({
      data: skillCatalog,
      error: null,
    }),
    {
      response: {
        200: ApiSuccess(t.Array(SkillCatalogEntry)),
        500: ApiFailure,
      },
    },
  )
  .get(
    "/skills/unlocks",
    async ({ set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to access Skill Branches.",
          },
        };
      }

      const unlocks = await db
        .select({
          id: schema.skillUnlocks.skillId,
          tier: schema.skillUnlocks.tier,
        })
        .from(schema.skillUnlocks)
        .where(eq(schema.skillUnlocks.userId, user.id));

      const [progress] = await db
        .select({
          skillPoints: schema.userProgress.skillPoints,
        })
        .from(schema.userProgress)
        .where(eq(schema.userProgress.userId, user.id))
        .limit(1);

      return {
        data: {
          skillPoints: progress?.skillPoints ?? 0,
          unlocks,
          effects: applySkillEffects(unlocks),
        },
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(
          t.Object({
            skillPoints: t.Number(),
            unlocks: t.Array(SkillUnlockEntry),
            effects: SkillEffectsSummary,
          }),
        ),
        401: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .post(
    "/skills/unlock",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to bind skills.",
          },
        };
      }

      const skill = getSkillDefinition(body.id);
      if (!skill) {
        set.status = 404;
        return {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Skill not found in the Codex.",
          },
        };
      }

      const unlocks = await db
        .select({
          id: schema.skillUnlocks.skillId,
          tier: schema.skillUnlocks.tier,
        })
        .from(schema.skillUnlocks)
        .where(eq(schema.skillUnlocks.userId, user.id));

      const [progress] = await db
        .select({
          id: schema.userProgress.id,
          skillPoints: schema.userProgress.skillPoints,
        })
        .from(schema.userProgress)
        .where(eq(schema.userProgress.userId, user.id))
        .limit(1);

      if (!progress) {
        set.status = 409;
        return {
          data: null,
          error: {
            code: "MISSING_PROGRESS",
            message: "Character record missing. Return to the Overview.",
          },
        };
      }

      const check = canUnlockSkill({
        skill,
        owned: unlocks,
        skillPoints: progress.skillPoints,
      });

      if (!check.ok) {
        set.status = 409;
        return {
          data: null,
          error: {
            code: "LOCKED",
            message: check.reason,
          },
        };
      }

      const cost = getSkillCost(skill, check.nextTier);
      await db.transaction(async (tx) => {
        const existing = unlocks.find((entry) => entry.id === skill.id);

        if (existing) {
          await tx
            .update(schema.skillUnlocks)
            .set({ tier: check.nextTier })
            .where(
              and(
                eq(schema.skillUnlocks.userId, user.id),
                eq(schema.skillUnlocks.skillId, skill.id),
              ),
            );
        } else {
          await tx.insert(schema.skillUnlocks).values({
            id: crypto.randomUUID(),
            userId: user.id,
            skillId: skill.id,
            tier: check.nextTier,
          });
        }

        await tx
          .update(schema.userProgress)
          .set({ skillPoints: Math.max(0, progress.skillPoints - cost) })
          .where(eq(schema.userProgress.id, progress.id));
      });

      return {
        data: {
          id: skill.id,
          tier: check.nextTier,
          remainingSkillPoints: Math.max(0, progress.skillPoints - cost),
        },
        error: null,
      };
    },
    {
      body: t.Object({
        id: t.String(),
      }),
      response: {
        200: ApiSuccess(
          t.Object({
            id: t.String(),
            tier: t.Number(),
            remainingSkillPoints: t.Number(),
          }),
        ),
        401: ApiFailure,
        404: ApiFailure,
        409: ApiFailure,
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
