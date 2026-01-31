import { Elysia, t } from "elysia";
import type { TSchema } from "@sinclair/typebox";
import { and, eq, sql } from "drizzle-orm";
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
import { calculateRewards } from "@/lib/economy/engine";

const NullableString = t.Union([t.String(), t.Null()]);

const ChallengeSummary = t.Object({
  id: t.String(),
  slug: t.String(),
  title: t.String(),
  description: NullableString,
  language: t.String(),
  bugTier: t.String(),
  codexLink: NullableString,
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

const CurrencyWallet = t.Object({
  bytes: t.Number(),
  focus: t.Number(),
  commits: t.Number(),
});

const RewardModifiers = t.Object({
  combo: t.Optional(t.Number()),
  critical: t.Optional(t.Boolean()),
  flawless: t.Optional(t.Boolean()),
});

const EconomyAwardRequest = t.Object({
  bugTier: t.String(),
  performance: t.Number(),
  modifiers: t.Optional(RewardModifiers),
});

const EconomySpendRequest = t.Object({
  currency: t.Union([t.Literal("bytes"), t.Literal("focus"), t.Literal("commits")]),
  amount: t.Number(),
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
          codexLink: schema.challenges.codexLink,
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
          codexLink: schema.challenges.codexLink,
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
            codexLink: NullableString,
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

      try {
        const result = await db.transaction(async (tx) => {
          const unlocks = await tx
            .select({
              id: schema.skillUnlocks.skillId,
              tier: schema.skillUnlocks.tier,
            })
            .from(schema.skillUnlocks)
            .where(eq(schema.skillUnlocks.userId, user.id));

          const [progress] = await tx
            .select({
              id: schema.userProgress.id,
              skillPoints: schema.userProgress.skillPoints,
            })
            .from(schema.userProgress)
            .where(eq(schema.userProgress.userId, user.id))
            .limit(1);

          if (!progress) {
            throw new Error("MISSING_PROGRESS");
          }

          const check = canUnlockSkill({
            skill,
            owned: unlocks,
            skillPoints: progress.skillPoints,
          });

          if (!check.ok) {
            const error = new Error("LOCKED");
            (error as Error & { reason?: string }).reason = check.reason;
            throw error;
          }

          const currentTier = unlocks.find((entry) => entry.id === skill.id)?.tier ?? 0;
          const nextTier = currentTier + 1;
          const cost = getSkillCost(skill, nextTier);

          const spend = await tx
            .update(schema.userProgress)
            .set({ skillPoints: sql`${schema.userProgress.skillPoints} - ${cost}` })
            .where(
              and(
                eq(schema.userProgress.id, progress.id),
                sql`${schema.userProgress.skillPoints} >= ${cost}`,
              ),
            )
            .returning({ skillPoints: schema.userProgress.skillPoints });

          if (!spend.length) {
            throw new Error("INSUFFICIENT_SKILL_POINTS");
          }

          if (currentTier > 0) {
            const updated = await tx
              .update(schema.skillUnlocks)
              .set({ tier: nextTier })
              .where(
                and(
                  eq(schema.skillUnlocks.userId, user.id),
                  eq(schema.skillUnlocks.skillId, skill.id),
                  eq(schema.skillUnlocks.tier, currentTier),
                ),
              )
              .returning({ tier: schema.skillUnlocks.tier });

            if (!updated.length) {
              throw new Error("SKILL_ALREADY_ADVANCED");
            }
          } else {
            const inserted = await tx
              .insert(schema.skillUnlocks)
              .values({
                id: crypto.randomUUID(),
                userId: user.id,
                skillId: skill.id,
                tier: nextTier,
              })
              .onConflictDoNothing({
                target: [schema.skillUnlocks.userId, schema.skillUnlocks.skillId],
              })
              .returning({ tier: schema.skillUnlocks.tier });

            if (!inserted.length) {
              throw new Error("SKILL_ALREADY_ADVANCED");
            }
          }

          return {
            tier: nextTier,
            remainingSkillPoints: spend[0]?.skillPoints ?? 0,
          };
        });

        return {
          data: {
            id: skill.id,
            tier: result.tier,
            remainingSkillPoints: result.remainingSkillPoints,
          },
          error: null,
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "LOCKED";

        if (reason === "MISSING_PROGRESS") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "MISSING_PROGRESS",
              message: "Character record missing. Return to the Overview.",
            },
          };
        }

        if (reason === "INSUFFICIENT_SKILL_POINTS") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "Not enough Skill Points.",
            },
          };
        }

        if (reason === "SKILL_ALREADY_ADVANCED") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "Skill already advanced.",
            },
          };
        }

        if (reason === "LOCKED" && error instanceof Error && "reason" in error) {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: (error as Error & { reason?: string }).reason ?? "Skill locked.",
            },
          };
        }

        throw error;
      }
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
  .get(
    "/economy/wallet",
    async ({ set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to access your vault.",
          },
        };
      }

      const [wallet] = await db
        .select({
          bytes: schema.currencies.bytes,
          focus: schema.currencies.focus,
          commits: schema.currencies.commits,
        })
        .from(schema.currencies)
        .where(eq(schema.currencies.userId, user.id))
        .limit(1);

      if (wallet) {
        return { data: wallet, error: null };
      }

      const [created] = await db
        .insert(schema.currencies)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          bytes: 0,
          focus: 0,
          commits: 0,
        })
        .onConflictDoNothing({ target: [schema.currencies.userId] })
        .returning({
          bytes: schema.currencies.bytes,
          focus: schema.currencies.focus,
          commits: schema.currencies.commits,
        });

      return {
        data: created ?? { bytes: 0, focus: 0, commits: 0 },
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(CurrencyWallet),
        401: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .post(
    "/economy/award",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to claim rewards.",
          },
        };
      }

      const reward = calculateRewards(body);

      const [updated] = await db
        .insert(schema.currencies)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          bytes: reward.bytes,
          focus: reward.focus,
          commits: reward.commits,
        })
        .onConflictDoUpdate({
          target: [schema.currencies.userId],
          set: {
            bytes: sql`${schema.currencies.bytes} + ${reward.bytes}`,
            focus: sql`${schema.currencies.focus} + ${reward.focus}`,
            commits: sql`${schema.currencies.commits} + ${reward.commits}`,
          },
        })
        .returning({
          bytes: schema.currencies.bytes,
          focus: schema.currencies.focus,
          commits: schema.currencies.commits,
        });

      return {
        data: {
          ...updated,
          awarded: reward,
        },
        error: null,
      };
    },
    {
      body: EconomyAwardRequest,
      response: {
        200: ApiSuccess(
          t.Object({
            bytes: t.Number(),
            focus: t.Number(),
            commits: t.Number(),
            awarded: CurrencyWallet,
          }),
        ),
        401: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .post(
    "/economy/spend",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to spend resources.",
          },
        };
      }

      const amount = Math.max(0, Math.floor(body.amount));
      if (amount <= 0) {
        set.status = 409;
        return {
          data: null,
          error: {
            code: "INVALID_SPEND",
            message: "Spend amount must be greater than zero.",
          },
        };
      }

      const column =
        body.currency === "bytes"
          ? schema.currencies.bytes
          : body.currency === "focus"
            ? schema.currencies.focus
            : schema.currencies.commits;

      const updatedRows = await db
        .update(schema.currencies)
        .set({
          bytes:
            body.currency === "bytes"
              ? sql`${schema.currencies.bytes} - ${amount}`
              : schema.currencies.bytes,
          focus:
            body.currency === "focus"
              ? sql`${schema.currencies.focus} - ${amount}`
              : schema.currencies.focus,
          commits:
            body.currency === "commits"
              ? sql`${schema.currencies.commits} - ${amount}`
              : schema.currencies.commits,
        })
        .where(and(eq(schema.currencies.userId, user.id), sql`${column} >= ${amount}`))
        .returning({
          bytes: schema.currencies.bytes,
          focus: schema.currencies.focus,
          commits: schema.currencies.commits,
        });

      if (!updatedRows.length) {
        set.status = 409;
        return {
          data: null,
          error: {
            code: "LOCKED",
            message: "Not enough resources to spend.",
          },
        };
      }

      return {
        data: updatedRows[0],
        error: null,
      };
    },
    {
      body: EconomySpendRequest,
      response: {
        200: ApiSuccess(CurrencyWallet),
        401: ApiFailure,
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
