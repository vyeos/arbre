import { Elysia, t } from "elysia";
import type { TSchema } from "@sinclair/typebox";
import { and, eq, sql } from "drizzle-orm";
import crypto from "crypto";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { executeInSandbox } from "@/lib/execution/sandbox";
import { getCurrentUser, isAdmin } from "@/lib/auth-session";
import { applySkillEffects, getSkillCost } from "@/lib/skills/engine";
import { skillCatalog } from "@/lib/skills/catalog";
import { calculateRewards } from "@/lib/economy/engine";
import { getCache, setCache } from "@/lib/cache/redis";
import { cacheKeys } from "@/lib/cache/keys";
import { modifierCatalog } from "@/lib/modifiers/catalog";
import { calculateDifficulty } from "@/lib/difficulty/engine";
import { invalidateCoreCaches } from "@/lib/cache/invalidate";

const NullableString = t.Union([t.String(), t.Null()]);

const ChallengeSummary = t.Object({
  id: t.String(),
  slug: t.String(),
  title: t.String(),
  description: NullableString,
  language: t.String(),
  bugTier: t.String(),
  codexLink: NullableString,
  createdAt: t.String(),
});

type ChallengeSummaryRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string;
  bugTier: string;
  codexLink: string | null;
  createdAt: string;
};

const QuestStatus = t.Union([
  t.Literal("ACTIVE"),
  t.Literal("COMPLETED"),
  t.Literal("LOCKED"),
  t.Literal("SKIPPED"),
]);

const QuestStateEntry = t.Object({
  challengeId: t.String(),
  status: QuestStatus,
  finalCode: NullableString,
});

const QuestStateResponse = t.Object({
  activeChallengeId: NullableString,
  states: t.Array(QuestStateEntry),
});

const SkillSummary = t.Object({
  id: t.String(),
  name: t.String(),
  description: NullableString,
  category: t.String(),
  maxTier: t.Number(),
  costGold: t.Number(),
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

const CharacterVesselSchema = t.Object({
  bodyType: t.String(),
  skinTone: t.String(),
  hairStyle: t.String(),
  hairColor: t.String(),
  eyeStyle: NullableString,
});

const RelicSummary = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  slot: t.String(),
  rarity: t.String(),
  priceGold: t.Number(),
  unlockCondition: NullableString,
  requiresSkillId: NullableString,
  isLimited: t.Boolean(),
  isAvailable: t.Boolean(),
});

const RelicCatalogEntry = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  slot: t.String(),
  rarity: t.String(),
  priceGold: t.Number(),
  unlockCondition: NullableString,
  requiresSkillId: NullableString,
  isLimited: t.Boolean(),
  isAvailable: t.Boolean(),
  isSealed: t.Boolean(),
  owned: t.Boolean(),
  bound: t.Boolean(),
});

const CurrencyWallet = t.Object({
  bytes: t.Number(),
  focus: t.Number(),
  commits: t.Number(),
  gold: t.Number(),
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
  currency: t.Union([
    t.Literal("bytes"),
    t.Literal("focus"),
    t.Literal("commits"),
    t.Literal("gold"),
  ]),
  amount: t.Number(),
});

const ModifierEntry = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  rewardMultiplier: t.Number(),
});

const DifficultyPreviewRequest = t.Object({
  rank: t.Number(),
  bugTier: t.String(),
  baseDrain: t.Number(),
});

const DifficultyPreviewResponse = t.Object({
  label: t.String(),
  drainMultiplier: t.Number(),
  rewardMultiplier: t.Number(),
  scaledDrain: t.Number(),
});

const AdminChallengeCreate = t.Object({
  slug: t.String(),
  title: t.String(),
  description: t.Optional(t.String()),
  language: t.String(),
  bugTier: t.String(),
  starterCode: t.String(),
  constraints: t.Optional(t.Record(t.String(), t.Unknown())),
  rewards: t.Optional(t.Record(t.String(), t.Unknown())),
  codexLink: t.Optional(t.String()),
  serverHealthDrainRate: t.Optional(t.Number()),
});

const AdminSkillCreate = t.Object({
  name: t.String(),
  category: t.String(),
  maxTier: t.Number(),
  costGold: t.Optional(t.Number()),
  isPassive: t.Optional(t.Boolean()),
  effects: t.Optional(t.Record(t.String(), t.Unknown())),
});

const AwardedReward = t.Object({
  bytes: t.Number(),
  focus: t.Number(),
  commits: t.Number(),
  gold: t.Number(),
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

const requireAdmin = async (set: { status?: number | string }) => {
  const user = await getCurrentUser();
  if (!user) {
    set.status = 401;
    return {
      data: null,
      error: {
        code: "UNAUTHORIZED",
        message: "Gate sealed. Admin sigil required.",
      },
    };
  }

  if (!isAdmin(user)) {
    set.status = 403;
    return {
      data: null,
      error: {
        code: "FORBIDDEN",
        message: "Admin sigil required.",
      },
    };
  }

  return null;
};

const coerceReward = (value: unknown) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
};

const normalizeRewards = (raw: unknown) => {
  const rewards = (raw ?? {}) as Record<string, unknown>;
  return {
    bytes: coerceReward(rewards.bytes),
    focus: coerceReward(rewards.focus),
    commits: coerceReward(rewards.commits),
    gold: coerceReward(rewards.gold),
  };
};

const loadOrderedChallenges = async () =>
  db
    .select({
      id: schema.challenges.id,
      createdAt: schema.challenges.createdAt,
    })
    .from(schema.challenges)
    .orderBy(schema.challenges.createdAt, schema.challenges.id);

const ensureQuestStates = async (userId: string) => {
  const challenges = await loadOrderedChallenges();
  if (!challenges.length) {
    return { activeChallengeId: null, states: [] as (typeof schema.questStates.$inferSelect)[] };
  }

  const existing = await db
    .select({
      challengeId: schema.questStates.challengeId,
      status: schema.questStates.status,
      finalCode: schema.questStates.finalCode,
    })
    .from(schema.questStates)
    .where(eq(schema.questStates.userId, userId));

  const existingSet = new Set(existing.map((entry) => entry.challengeId));
  const missing = challenges.filter((entry) => !existingSet.has(entry.id));

  if (missing.length) {
    await db.insert(schema.questStates).values(
      missing.map((entry, index) => {
        const status = (existing.length === 0 && index === 0 ? "ACTIVE" : "LOCKED") as
          | "ACTIVE"
          | "LOCKED";
        return {
          id: crypto.randomUUID(),
          userId,
          challengeId: entry.id,
          status,
        };
      }),
    );
  }

  const states = await db
    .select({
      challengeId: schema.questStates.challengeId,
      status: schema.questStates.status,
      finalCode: schema.questStates.finalCode,
    })
    .from(schema.questStates)
    .where(eq(schema.questStates.userId, userId));

  const orderIndex = new Map(challenges.map((entry, index) => [entry.id, index]));
  const activeStates = states.filter((entry) => entry.status === "ACTIVE");
  const selectNextByStatus = (status: "SKIPPED" | "LOCKED") =>
    states
      .filter((entry) => entry.status === status)
      .sort(
        (a, b) => (orderIndex.get(a.challengeId) ?? 0) - (orderIndex.get(b.challengeId) ?? 0),
      )[0];

  let active = activeStates.sort(
    (a, b) => (orderIndex.get(a.challengeId) ?? 0) - (orderIndex.get(b.challengeId) ?? 0),
  )[0];

  if (!active) {
    active = selectNextByStatus("SKIPPED") ?? selectNextByStatus("LOCKED");
    if (active) {
      await db
        .update(schema.questStates)
        .set({ status: "ACTIVE" })
        .where(
          and(
            eq(schema.questStates.userId, userId),
            eq(schema.questStates.challengeId, active.challengeId),
          ),
        );
    }
  }

  if (activeStates.length > 1 || (active && activeStates.length === 1 && activeStates[0])) {
    await db
      .update(schema.questStates)
      .set({ status: "LOCKED" })
      .where(
        and(
          eq(schema.questStates.userId, userId),
          eq(schema.questStates.status, "ACTIVE"),
          active ? sql`${schema.questStates.challengeId} <> ${active.challengeId}` : sql`true`,
        ),
      );
  }

  const refreshed = await db
    .select({
      challengeId: schema.questStates.challengeId,
      status: schema.questStates.status,
      finalCode: schema.questStates.finalCode,
    })
    .from(schema.questStates)
    .where(eq(schema.questStates.userId, userId));

  const activeChallengeId =
    refreshed.find((entry) => entry.status === "ACTIVE")?.challengeId ?? null;
  return { activeChallengeId, states: refreshed };
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
      const cached = await getCache<ChallengeSummaryRow[]>(cacheKeys.challenges);
      if (cached) {
        return {
          data: cached.map((row) => ({
            ...row,
            createdAt:
              typeof row.createdAt === "string"
                ? row.createdAt
                : new Date(row.createdAt).toISOString(),
          })),
          error: null,
        };
      }

      const rows = await db
        .select({
          id: schema.challenges.id,
          slug: schema.challenges.slug,
          title: schema.challenges.title,
          description: schema.challenges.description,
          language: schema.challenges.language,
          bugTier: schema.challenges.bugTier,
          codexLink: schema.challenges.codexLink,
          createdAt: schema.challenges.createdAt,
        })
        .from(schema.challenges);

      const normalized = rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      }));

      await setCache(cacheKeys.challenges, normalized);

      return {
        data: normalized,
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
      const cached = await getCache<typeof schema.challenges.$inferSelect>(
        cacheKeys.challengeBySlug(params.slug),
      );
      if (cached) {
        return {
          data: cached,
          error: null,
        };
      }

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

      await setCache(cacheKeys.challengeBySlug(params.slug), row);

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
    "/quests/state",
    async ({ set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to access your Quest states.",
          },
        };
      }

      const result = await ensureQuestStates(user.id);
      return {
        data: result,
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(QuestStateResponse),
        401: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .post(
    "/quests/complete",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to bind quest victories.",
          },
        };
      }

      await ensureQuestStates(user.id);
      const challenges = await loadOrderedChallenges();
      const orderIndex = new Map(challenges.map((entry, index) => [entry.id, index]));

      try {
        const result = await db.transaction(async (tx) => {
          const [state] = await tx
            .select({
              status: schema.questStates.status,
            })
            .from(schema.questStates)
            .where(
              and(
                eq(schema.questStates.userId, user.id),
                eq(schema.questStates.challengeId, body.challengeId),
              ),
            )
            .limit(1);

          if (!state) {
            throw new Error("QUEST_NOT_FOUND");
          }

          if (state.status !== "ACTIVE") {
            throw new Error("QUEST_LOCKED");
          }

          const [challenge] = await tx
            .select({
              rewards: schema.challenges.rewards,
            })
            .from(schema.challenges)
            .where(eq(schema.challenges.id, body.challengeId))
            .limit(1);

          if (!challenge) {
            throw new Error("QUEST_NOT_FOUND");
          }

          const reward = normalizeRewards(challenge.rewards);

          await tx
            .update(schema.questStates)
            .set({
              status: "COMPLETED",
              finalCode: body.finalCode,
            })
            .where(
              and(
                eq(schema.questStates.userId, user.id),
                eq(schema.questStates.challengeId, body.challengeId),
              ),
            );

          const [wallet] = await tx
            .insert(schema.currencies)
            .values({
              id: crypto.randomUUID(),
              userId: user.id,
              bytes: reward.bytes,
              focus: reward.focus,
              commits: reward.commits,
              gold: reward.gold,
            })
            .onConflictDoUpdate({
              target: [schema.currencies.userId],
              set: {
                bytes: sql`${schema.currencies.bytes} + ${reward.bytes}`,
                focus: sql`${schema.currencies.focus} + ${reward.focus}`,
                commits: sql`${schema.currencies.commits} + ${reward.commits}`,
                gold: sql`${schema.currencies.gold} + ${reward.gold}`,
              },
            })
            .returning({
              bytes: schema.currencies.bytes,
              focus: schema.currencies.focus,
              commits: schema.currencies.commits,
              gold: schema.currencies.gold,
            });

          const states = await tx
            .select({
              challengeId: schema.questStates.challengeId,
              status: schema.questStates.status,
            })
            .from(schema.questStates)
            .where(eq(schema.questStates.userId, user.id));

          const nextSkipped = states
            .filter((entry) => entry.status === "SKIPPED")
            .sort(
              (a, b) => (orderIndex.get(a.challengeId) ?? 0) - (orderIndex.get(b.challengeId) ?? 0),
            )[0];

          let nextActiveId: string | null = null;
          if (nextSkipped) {
            nextActiveId = nextSkipped.challengeId;
          } else {
            const currentIndex = orderIndex.get(body.challengeId) ?? -1;
            const nextLocked = states
              .filter((entry) => entry.status === "LOCKED")
              .sort(
                (a, b) =>
                  (orderIndex.get(a.challengeId) ?? 0) - (orderIndex.get(b.challengeId) ?? 0),
              )
              .find((entry) => (orderIndex.get(entry.challengeId) ?? 0) > currentIndex);
            nextActiveId = nextLocked?.challengeId ?? null;
          }

          if (nextActiveId) {
            await tx
              .update(schema.questStates)
              .set({ status: "LOCKED" })
              .where(
                and(
                  eq(schema.questStates.userId, user.id),
                  eq(schema.questStates.status, "ACTIVE"),
                ),
              );

            await tx
              .update(schema.questStates)
              .set({ status: "ACTIVE" })
              .where(
                and(
                  eq(schema.questStates.userId, user.id),
                  eq(schema.questStates.challengeId, nextActiveId),
                ),
              );
          }

          return { wallet: wallet ?? null, reward };
        });

        return {
          data: result,
          error: null,
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "LOCKED";
        if (reason === "QUEST_LOCKED") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "Quest is not active.",
            },
          };
        }
        if (reason === "QUEST_NOT_FOUND") {
          set.status = 404;
          return {
            data: null,
            error: {
              code: "NOT_FOUND",
              message: "Quest not found.",
            },
          };
        }
        throw error;
      }
    },
    {
      body: t.Object({
        challengeId: t.String(),
        finalCode: t.String(),
      }),
      response: {
        200: ApiSuccess(
          t.Object({
            wallet: CurrencyWallet,
            reward: AwardedReward,
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
    "/quests/skip",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to skip a quest.",
          },
        };
      }

      await ensureQuestStates(user.id);
      const challenges = await loadOrderedChallenges();
      const orderIndex = new Map(challenges.map((entry, index) => [entry.id, index]));

      try {
        const result = await db.transaction(async (tx) => {
          const [state] = await tx
            .select({
              status: schema.questStates.status,
            })
            .from(schema.questStates)
            .where(
              and(
                eq(schema.questStates.userId, user.id),
                eq(schema.questStates.challengeId, body.challengeId),
              ),
            )
            .limit(1);

          if (!state) {
            throw new Error("QUEST_NOT_FOUND");
          }

          if (state.status !== "ACTIVE") {
            throw new Error("QUEST_LOCKED");
          }

          const [wallet] = await tx
            .select({
              bytes: schema.currencies.bytes,
              focus: schema.currencies.focus,
              commits: schema.currencies.commits,
              gold: schema.currencies.gold,
            })
            .from(schema.currencies)
            .where(eq(schema.currencies.userId, user.id))
            .limit(1);

          const availableBytes = wallet?.bytes ?? 0;
          if (availableBytes < body.cost) {
            throw new Error("INSUFFICIENT_BYTES");
          }

          const [updatedWallet] = await tx
            .update(schema.currencies)
            .set({ bytes: sql`${schema.currencies.bytes} - ${body.cost}` })
            .where(
              and(
                eq(schema.currencies.userId, user.id),
                sql`${schema.currencies.bytes} >= ${body.cost}`,
              ),
            )
            .returning({
              bytes: schema.currencies.bytes,
              focus: schema.currencies.focus,
              commits: schema.currencies.commits,
              gold: schema.currencies.gold,
            });

          if (!updatedWallet) {
            throw new Error("INSUFFICIENT_BYTES");
          }

          await tx
            .update(schema.questStates)
            .set({ status: "SKIPPED" })
            .where(
              and(
                eq(schema.questStates.userId, user.id),
                eq(schema.questStates.challengeId, body.challengeId),
              ),
            );

          const currentIndex = orderIndex.get(body.challengeId) ?? -1;
          const states = await tx
            .select({
              challengeId: schema.questStates.challengeId,
              status: schema.questStates.status,
            })
            .from(schema.questStates)
            .where(eq(schema.questStates.userId, user.id));

          const nextLocked = states
            .filter((entry) => entry.status === "LOCKED")
            .sort(
              (a, b) => (orderIndex.get(a.challengeId) ?? 0) - (orderIndex.get(b.challengeId) ?? 0),
            )
            .find((entry) => (orderIndex.get(entry.challengeId) ?? 0) > currentIndex);

          if (!nextLocked) {
            throw new Error("NO_NEXT_QUEST");
          }

          await tx
            .update(schema.questStates)
            .set({ status: "LOCKED" })
            .where(
              and(eq(schema.questStates.userId, user.id), eq(schema.questStates.status, "ACTIVE")),
            );

          await tx
            .update(schema.questStates)
            .set({ status: "ACTIVE" })
            .where(
              and(
                eq(schema.questStates.userId, user.id),
                eq(schema.questStates.challengeId, nextLocked.challengeId),
              ),
            );

          return { wallet: updatedWallet };
        });

        return {
          data: result,
          error: null,
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "LOCKED";
        if (reason === "INSUFFICIENT_BYTES") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "Not enough Bytes.",
            },
          };
        }
        if (reason === "QUEST_LOCKED") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "Quest is not active.",
            },
          };
        }
        if (reason === "QUEST_NOT_FOUND") {
          set.status = 404;
          return {
            data: null,
            error: {
              code: "NOT_FOUND",
              message: "Quest not found.",
            },
          };
        }
        if (reason === "NO_NEXT_QUEST") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "No further quests are available to skip into.",
            },
          };
        }
        throw error;
      }
    },
    {
      body: t.Object({
        challengeId: t.String(),
        cost: t.Number(),
      }),
      response: {
        200: ApiSuccess(t.Object({ wallet: CurrencyWallet })),
        401: ApiFailure,
        404: ApiFailure,
        409: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .get(
    "/skills",
    async () => {
      const cached = await getCache<(typeof schema.skills.$inferSelect)[]>(cacheKeys.skills);
      if (cached) {
        return {
          data: cached,
          error: null,
        };
      }

      const rows = await db
        .select({
          id: schema.skills.id,
          name: schema.skills.name,
          description: schema.skills.description,
          category: schema.skills.category,
          maxTier: schema.skills.maxTier,
          costGold: schema.skills.costGold,
          isPassive: schema.skills.isPassive,
        })
        .from(schema.skills);

      await setCache(cacheKeys.skills, rows);

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
    async () => {
      const cached = await getCache<typeof skillCatalog>(cacheKeys.skillCatalog);
      if (cached) {
        return {
          data: cached,
          error: null,
        };
      }

      await setCache(cacheKeys.skillCatalog, skillCatalog);

      return {
        data: skillCatalog,
        error: null,
      };
    },
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
          bytes: schema.currencies.bytes,
        })
        .from(schema.currencies)
        .where(eq(schema.currencies.userId, user.id))
        .limit(1);

      return {
        data: {
          bytes: progress?.bytes ?? 0,
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
            bytes: t.Number(),
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

      const [skill] = await db
        .select({
          id: schema.skills.id,
          name: schema.skills.name,
          description: schema.skills.description,
          category: schema.skills.category,
          maxTier: schema.skills.maxTier,
          costGold: schema.skills.costGold,
          effects: schema.skills.effects,
          isPassive: schema.skills.isPassive,
        })
        .from(schema.skills)
        .where(eq(schema.skills.id, body.id))
        .limit(1);

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
          const [wallet] = await tx
            .select({
              bytes: schema.currencies.bytes,
            })
            .from(schema.currencies)
            .where(eq(schema.currencies.userId, user.id))
            .limit(1);

          const resolvedCosts = Array.from({ length: skill.maxTier }, () =>
            Math.max(1, Math.floor(skill.costGold ?? 10)),
          );

          const currentTier = unlocks.find((entry) => entry.id === skill.id)?.tier ?? 0;
          const nextTier = currentTier + 1;

          if (nextTier > skill.maxTier) {
            throw new Error("SKILL_ALREADY_ADVANCED");
          }

          const cost = getSkillCost(
            {
              id: skill.id,
              name: skill.name,
              description: skill.description ?? "",
              branch: skill.category,
              maxTier: skill.maxTier,
              costs: resolvedCosts,
              effects: [],
              isPassive: skill.isPassive,
            },
            nextTier,
          );

          const availableBytes = wallet?.bytes ?? 0;
          if (availableBytes < cost) {
            throw new Error("INSUFFICIENT_BYTES");
          }

          const spend = await tx
            .update(schema.currencies)
            .set({ bytes: sql`${schema.currencies.bytes} - ${cost}` })
            .where(
              and(
                eq(schema.currencies.userId, user.id),
                sql`${schema.currencies.bytes} >= ${cost}`,
              ),
            )
            .returning({ bytes: schema.currencies.bytes });

          if (!spend.length) {
            throw new Error("INSUFFICIENT_BYTES");
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
            remainingBytes: spend[0]?.bytes ?? 0,
          };
        });

        return {
          data: {
            id: skill.id,
            tier: result.tier,
            remainingBytes: result.remainingBytes,
          },
          error: null,
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "LOCKED";

        if (reason === "INSUFFICIENT_BYTES") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "Not enough Bytes.",
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
            remainingBytes: t.Number(),
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
    "/admin/users",
    async ({ set }) => {
      const guard = await requireAdmin(set);
      if (guard) return guard;

      const rows = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users);

      return {
        data: rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
        })),
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(
          t.Array(
            t.Object({
              id: t.String(),
              name: NullableString,
              email: t.String(),
              role: NullableString,
              createdAt: t.String(),
            }),
          ),
        ),
        401: ApiFailure,
        403: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .get(
    "/admin/challenges",
    async ({ set }) => {
      const guard = await requireAdmin(set);
      if (guard) return guard;

      const rows = await db
        .select({
          id: schema.challenges.id,
          slug: schema.challenges.slug,
          title: schema.challenges.title,
          language: schema.challenges.language,
          bugTier: schema.challenges.bugTier,
          createdAt: schema.challenges.createdAt,
        })
        .from(schema.challenges);

      return {
        data: rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
        })),
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(
          t.Array(
            t.Object({
              id: t.String(),
              slug: t.String(),
              title: t.String(),
              language: t.String(),
              bugTier: t.String(),
              createdAt: t.String(),
            }),
          ),
        ),
        401: ApiFailure,
        403: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .get(
    "/admin/skills",
    async ({ set }) => {
      const guard = await requireAdmin(set);
      if (guard) return guard;

      const rows = await db
        .select({
          id: schema.skills.id,
          name: schema.skills.name,
          category: schema.skills.category,
          maxTier: schema.skills.maxTier,
          isPassive: schema.skills.isPassive,
          createdAt: schema.skills.createdAt,
        })
        .from(schema.skills);

      return {
        data: rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
        })),
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(
          t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              category: t.String(),
              maxTier: t.Number(),
              isPassive: t.Boolean(),
              createdAt: t.String(),
            }),
          ),
        ),
        401: ApiFailure,
        403: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .post(
    "/admin/challenges",
    async ({ body, set }) => {
      const guard = await requireAdmin(set);
      if (guard) return guard;

      const [created] = await db
        .insert(schema.challenges)
        .values({
          id: crypto.randomUUID(),
          slug: body.slug,
          title: body.title,
          description: body.description ?? null,
          language: body.language,
          bugTier: body.bugTier,
          starterCode: body.starterCode,
          constraints: body.constraints ?? {},
          rewards: body.rewards ?? {},
          codexLink: body.codexLink ?? null,
          serverHealthDrainRate: body.serverHealthDrainRate ?? 1,
        })
        .returning({
          id: schema.challenges.id,
          slug: schema.challenges.slug,
          title: schema.challenges.title,
          language: schema.challenges.language,
          bugTier: schema.challenges.bugTier,
          createdAt: schema.challenges.createdAt,
        });

      await invalidateCoreCaches();

      return {
        data: {
          ...created,
          createdAt: created.createdAt.toISOString(),
        },
        error: null,
      };
    },
    {
      body: AdminChallengeCreate,
      response: {
        200: ApiSuccess(
          t.Object({
            id: t.String(),
            slug: t.String(),
            title: t.String(),
            language: t.String(),
            bugTier: t.String(),
            createdAt: t.String(),
          }),
        ),
        401: ApiFailure,
        403: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .post(
    "/admin/skills",
    async ({ body, set }) => {
      const guard = await requireAdmin(set);
      if (guard) return guard;

      const [created] = await db
        .insert(schema.skills)
        .values({
          id: crypto.randomUUID(),
          name: body.name,
          description: null,
          category: body.category,
          maxTier: body.maxTier,
          costGold: Math.max(1, Math.floor(body.costGold ?? 10)),
          effects: body.effects ?? {},
          isPassive: body.isPassive ?? true,
        })
        .returning({
          id: schema.skills.id,
          name: schema.skills.name,
          category: schema.skills.category,
          maxTier: schema.skills.maxTier,
          costGold: schema.skills.costGold,
          isPassive: schema.skills.isPassive,
          createdAt: schema.skills.createdAt,
        });

      await invalidateCoreCaches();

      return {
        data: {
          ...created,
          createdAt: created.createdAt.toISOString(),
        },
        error: null,
      };
    },
    {
      body: AdminSkillCreate,
      response: {
        200: ApiSuccess(
          t.Object({
            id: t.String(),
            name: t.String(),
            category: t.String(),
            maxTier: t.Number(),
            costGold: t.Number(),
            isPassive: t.Boolean(),
            createdAt: t.String(),
          }),
        ),
        401: ApiFailure,
        403: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .get(
    "/modifiers",
    () => ({
      data: modifierCatalog,
      error: null,
    }),
    {
      response: {
        200: ApiSuccess(t.Array(ModifierEntry)),
        500: ApiFailure,
      },
    },
  )
  .post(
    "/difficulty/preview",
    async ({ body }) => {
      const profile = calculateDifficulty({
        rank: body.rank,
        bugTier: body.bugTier,
      });

      return {
        data: {
          ...profile,
          scaledDrain: Math.max(1, Math.round(body.baseDrain * profile.drainMultiplier)),
        },
        error: null,
      };
    },
    {
      body: DifficultyPreviewRequest,
      response: {
        200: ApiSuccess(DifficultyPreviewResponse),
        500: ApiFailure,
      },
    },
  )
  .get(
    "/armory/catalog",
    async () => {
      const user = await getCurrentUser();
      const relicRows = await db
        .select({
          id: schema.relics.id,
          name: schema.relics.name,
          description: schema.relics.description,
          slot: schema.relics.slot,
          rarity: schema.relics.rarity,
          priceGold: schema.relics.priceGold,
          unlockCondition: schema.relics.unlockCondition,
          requiresSkillId: schema.relics.requiresSkillId,
          isLimited: schema.relics.isLimited,
          isAvailable: schema.relics.isAvailable,
        })
        .from(schema.relics);

      if (!user) {
        const cached = await getCache<
          Array<{
            id: string;
            name: string;
            description: string;
            slot: string;
            rarity: string;
            priceGold: number;
            unlockCondition: string | null;
            requiresSkillId: string | null;
            isLimited: boolean;
            isAvailable: boolean;
            isSealed: boolean;
            owned: boolean;
            bound: boolean;
          }>
        >(cacheKeys.relicCatalog);
        if (cached) {
          return {
            data: cached,
            error: null,
          };
        }

        const response = relicRows.map((relic) => ({
          ...relic,
          unlockCondition: relic.unlockCondition ?? null,
          requiresSkillId: relic.requiresSkillId ?? null,
          isSealed: Boolean(relic.unlockCondition || relic.isLimited),
          owned: false,
          bound: false,
        }));

        await setCache(cacheKeys.relicCatalog, response);

        return {
          data: response,
          error: null,
        };
      }

      const [unlocks, inventory, bindings] = await Promise.all([
        db
          .select({
            id: schema.skillUnlocks.skillId,
          })
          .from(schema.skillUnlocks)
          .where(eq(schema.skillUnlocks.userId, user.id)),
        db
          .select({
            relicId: schema.relicInventory.relicId,
          })
          .from(schema.relicInventory)
          .where(eq(schema.relicInventory.userId, user.id)),
        db
          .select({
            relicId: schema.relicBindings.relicId,
          })
          .from(schema.relicBindings)
          .where(eq(schema.relicBindings.userId, user.id)),
      ]);

      const unlockedSkills = new Set(unlocks.map((item) => item.id));
      const ownedRelics = new Set(inventory.map((item) => item.relicId));
      const boundRelics = new Set(bindings.map((item) => item.relicId));

      const response = relicRows.map((relic) => {
        const requiresSkill = relic.requiresSkillId
          ? !unlockedSkills.has(relic.requiresSkillId)
          : false;
        const isSealed =
          !relic.isAvailable || requiresSkill || (relic.isLimited && !!relic.unlockCondition);

        return {
          ...relic,
          unlockCondition: relic.unlockCondition ?? null,
          requiresSkillId: relic.requiresSkillId ?? null,
          isSealed,
          owned: ownedRelics.has(relic.id),
          bound: boundRelics.has(relic.id),
        };
      });

      return {
        data: response,
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(t.Array(RelicCatalogEntry)),
        500: ApiFailure,
      },
    },
  )
  .get(
    "/armory/inventory",
    async ({ set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to access the Armory.",
          },
        };
      }

      const [vessel] = await db
        .select({
          bodyType: schema.characterVessels.bodyType,
          skinTone: schema.characterVessels.skinTone,
          hairStyle: schema.characterVessels.hairStyle,
          hairColor: schema.characterVessels.hairColor,
          eyeStyle: schema.characterVessels.eyeStyle,
        })
        .from(schema.characterVessels)
        .where(eq(schema.characterVessels.userId, user.id))
        .limit(1);

      const owned = await db
        .select({
          id: schema.relics.id,
          name: schema.relics.name,
          description: schema.relics.description,
          slot: schema.relics.slot,
          rarity: schema.relics.rarity,
          priceGold: schema.relics.priceGold,
          unlockCondition: schema.relics.unlockCondition,
          requiresSkillId: schema.relics.requiresSkillId,
          isLimited: schema.relics.isLimited,
          isAvailable: schema.relics.isAvailable,
        })
        .from(schema.relicInventory)
        .innerJoin(schema.relics, eq(schema.relicInventory.relicId, schema.relics.id))
        .where(eq(schema.relicInventory.userId, user.id));

      const bindings = await db
        .select({
          relicId: schema.relicBindings.relicId,
          slot: schema.relicBindings.slot,
        })
        .from(schema.relicBindings)
        .where(eq(schema.relicBindings.userId, user.id));

      return {
        data: {
          vessel: vessel ?? null,
          owned,
          bindings,
        },
        error: null,
      };
    },
    {
      response: {
        200: ApiSuccess(
          t.Object({
            vessel: t.Union([CharacterVesselSchema, t.Null()]),
            owned: t.Array(RelicSummary),
            bindings: t.Array(t.Object({ relicId: t.String(), slot: t.String() })),
          }),
        ),
        401: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .post(
    "/armory/vessel",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to bind your Avatar.",
          },
        };
      }

      const [existing] = await db
        .select({ id: schema.characterVessels.id })
        .from(schema.characterVessels)
        .where(eq(schema.characterVessels.userId, user.id))
        .limit(1);

      if (existing) {
        set.status = 409;
        return {
          data: null,
          error: {
            code: "AVATAR_EXISTS",
            message: "Avatar already forged.",
          },
        };
      }

      await db.insert(schema.characterVessels).values({
        id: crypto.randomUUID(),
        userId: user.id,
        bodyType: body.bodyType,
        skinTone: body.skinTone,
        hairStyle: body.hairStyle,
        hairColor: body.hairColor,
        eyeStyle: body.eyeStyle ?? null,
      });

      return {
        data: body,
        error: null,
      };
    },
    {
      body: CharacterVesselSchema,
      response: {
        200: ApiSuccess(CharacterVesselSchema),
        401: ApiFailure,
        409: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .put(
    "/armory/vessel",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to refine your Avatar.",
          },
        };
      }

      const [existing] = await db
        .select({ id: schema.characterVessels.id })
        .from(schema.characterVessels)
        .where(eq(schema.characterVessels.userId, user.id))
        .limit(1);

      if (!existing) {
        await db.insert(schema.characterVessels).values({
          id: crypto.randomUUID(),
          userId: user.id,
          bodyType: body.bodyType,
          skinTone: body.skinTone,
          hairStyle: body.hairStyle,
          hairColor: body.hairColor,
          eyeStyle: body.eyeStyle ?? null,
        });

        return {
          data: body,
          error: null,
        };
      }

      await db
        .update(schema.characterVessels)
        .set({
          bodyType: body.bodyType,
          skinTone: body.skinTone,
          hairStyle: body.hairStyle,
          hairColor: body.hairColor,
          eyeStyle: body.eyeStyle ?? null,
        })
        .where(eq(schema.characterVessels.userId, user.id));

      return {
        data: body,
        error: null,
      };
    },
    {
      body: CharacterVesselSchema,
      response: {
        200: ApiSuccess(CharacterVesselSchema),
        401: ApiFailure,
        500: ApiFailure,
      },
    },
  )
  .post(
    "/armory/acquire",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to acquire Relics.",
          },
        };
      }

      const [relic] = await db
        .select({
          id: schema.relics.id,
          priceGold: schema.relics.priceGold,
          isAvailable: schema.relics.isAvailable,
          unlockCondition: schema.relics.unlockCondition,
          requiresSkillId: schema.relics.requiresSkillId,
          isLimited: schema.relics.isLimited,
        })
        .from(schema.relics)
        .where(eq(schema.relics.id, body.relicId))
        .limit(1);

      if (!relic) {
        set.status = 404;
        return {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Relic not found in the Vault.",
          },
        };
      }

      if (!relic.isAvailable) {
        set.status = 409;
        return {
          data: null,
          error: {
            code: "SEALED",
            message: "Relic is sealed beyond reach.",
          },
        };
      }

      if (relic.requiresSkillId) {
        const [skillUnlock] = await db
          .select({ id: schema.skillUnlocks.id })
          .from(schema.skillUnlocks)
          .where(
            and(
              eq(schema.skillUnlocks.userId, user.id),
              eq(schema.skillUnlocks.skillId, relic.requiresSkillId),
            ),
          )
          .limit(1);

        if (!skillUnlock) {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "SEALED",
              message: relic.unlockCondition ?? "Relic sealed by mastery requirements.",
            },
          };
        }
      }

      try {
        const amount = relic.priceGold;
        const result = await db.transaction(async (tx) => {
          const [spend] = await tx
            .update(schema.currencies)
            .set({ gold: sql`${schema.currencies.gold} - ${amount}` })
            .where(
              and(
                eq(schema.currencies.userId, user.id),
                sql`${schema.currencies.gold} >= ${amount}`,
              ),
            )
            .returning({ gold: schema.currencies.gold });

          if (!spend) {
            throw new Error("INSUFFICIENT_GOLD");
          }

          const [inventory] = await tx
            .insert(schema.relicInventory)
            .values({
              id: crypto.randomUUID(),
              userId: user.id,
              relicId: relic.id,
            })
            .onConflictDoNothing({
              target: [schema.relicInventory.userId, schema.relicInventory.relicId],
            })
            .returning({ relicId: schema.relicInventory.relicId });

          if (!inventory) {
            throw new Error("ALREADY_OWNED");
          }

          return { remainingGold: spend.gold };
        });

        return {
          data: {
            relicId: relic.id,
            remainingGold: result.remainingGold,
          },
          error: null,
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "LOCKED";

        if (reason === "INSUFFICIENT_GOLD") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "Not enough Gold to Acquire this Relic.",
            },
          };
        }

        if (reason === "ALREADY_OWNED") {
          set.status = 409;
          return {
            data: null,
            error: {
              code: "LOCKED",
              message: "Relic already acquired.",
            },
          };
        }

        throw error;
      }
    },
    {
      body: t.Object({ relicId: t.String() }),
      response: {
        200: ApiSuccess(
          t.Object({
            relicId: t.String(),
            remainingGold: t.Number(),
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
    "/armory/bind",
    async ({ body, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Gate sealed. Sign in to bind Relics.",
          },
        };
      }

      const [owned] = await db
        .select({
          relicId: schema.relicInventory.relicId,
        })
        .from(schema.relicInventory)
        .where(
          and(
            eq(schema.relicInventory.userId, user.id),
            eq(schema.relicInventory.relicId, body.relicId),
          ),
        )
        .limit(1);

      if (!owned) {
        set.status = 409;
        return {
          data: null,
          error: {
            code: "LOCKED",
            message: "Relic not acquired. Visit the Vault to Acquire it.",
          },
        };
      }

      const [relic] = await db
        .select({ slot: schema.relics.slot })
        .from(schema.relics)
        .where(eq(schema.relics.id, body.relicId))
        .limit(1);

      if (!relic) {
        set.status = 404;
        return {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Relic not found in the Vault.",
          },
        };
      }

      const binding = await db.transaction(async (tx) => {
        await tx
          .delete(schema.relicBindings)
          .where(
            and(
              eq(schema.relicBindings.userId, user.id),
              eq(schema.relicBindings.relicId, body.relicId),
            ),
          );

        const [bound] = await tx
          .insert(schema.relicBindings)
          .values({
            id: crypto.randomUUID(),
            userId: user.id,
            relicId: body.relicId,
            slot: relic.slot,
          })
          .onConflictDoUpdate({
            target: [schema.relicBindings.userId, schema.relicBindings.slot],
            set: {
              relicId: body.relicId,
              boundAt: sql`NOW()`,
            },
          })
          .returning({ relicId: schema.relicBindings.relicId, slot: schema.relicBindings.slot });

        return bound;
      });

      return {
        data: binding,
        error: null,
      };
    },
    {
      body: t.Object({ relicId: t.String() }),
      response: {
        200: ApiSuccess(t.Object({ relicId: t.String(), slot: t.String() })),
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
          gold: schema.currencies.gold,
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
          gold: 0,
        })
        .onConflictDoNothing({ target: [schema.currencies.userId] })
        .returning({
          bytes: schema.currencies.bytes,
          focus: schema.currencies.focus,
          commits: schema.currencies.commits,
          gold: schema.currencies.gold,
        });

      return {
        data: created ?? { bytes: 0, focus: 0, commits: 0, gold: 0 },
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
          gold: reward.gold,
        })
        .onConflictDoUpdate({
          target: [schema.currencies.userId],
          set: {
            bytes: sql`${schema.currencies.bytes} + ${reward.bytes}`,
            focus: sql`${schema.currencies.focus} + ${reward.focus}`,
            commits: sql`${schema.currencies.commits} + ${reward.commits}`,
            gold: sql`${schema.currencies.gold} + ${reward.gold}`,
          },
        })
        .returning({
          bytes: schema.currencies.bytes,
          focus: schema.currencies.focus,
          commits: schema.currencies.commits,
          gold: schema.currencies.gold,
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
            gold: t.Number(),
            awarded: AwardedReward,
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
            : body.currency === "commits"
              ? schema.currencies.commits
              : schema.currencies.gold;

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
          gold:
            body.currency === "gold"
              ? sql`${schema.currencies.gold} - ${amount}`
              : schema.currencies.gold,
        })
        .where(and(eq(schema.currencies.userId, user.id), sql`${column} >= ${amount}`))
        .returning({
          bytes: schema.currencies.bytes,
          focus: schema.currencies.focus,
          commits: schema.currencies.commits,
          gold: schema.currencies.gold,
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
