import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["player", "admin"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("player"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verificationTokens_identifier_idx").on(table.identifier)],
);

export const authenticators = pgTable(
  "authenticators",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialId: text("credential_id").notNull(),
    publicKey: text("public_key").notNull(),
    counter: integer("counter").notNull().default(0),
    transports: text("transports"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("authenticators_credential_unique").on(table.credentialId),
    index("authenticators_user_id_idx").on(table.userId),
  ],
);

export const userProgress = pgTable(
  "user_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    level: integer("level").notNull().default(1),
    xp: integer("xp").notNull().default(0),
    skillPoints: integer("skill_points").notNull().default(0),
    lastPlayedAt: timestamp("last_played_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("user_progress_user_unique").on(table.userId)],
);

export const challenges = pgTable(
  "challenges",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    language: text("language").notNull(),
    bugTier: text("bug_tier").notNull(),
    starterCode: text("starter_code").notNull(),
    constraints: jsonb("constraints").notNull().default({}),
    rewards: jsonb("rewards").notNull().default({}),
    codexLink: text("codex_link"),
    serverHealthDrainRate: integer("server_health_drain_rate").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("challenges_slug_unique").on(table.slug),
    index("challenges_language_idx").on(table.language),
  ],
);

export const challengeRuns = pgTable(
  "challenge_runs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    challengeId: text("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    score: integer("score").notNull().default(0),
    editsUsed: integer("edits_used").notNull().default(0),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    logs: jsonb("logs").notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("challenge_runs_user_id_idx").on(table.userId),
    index("challenge_runs_challenge_id_idx").on(table.challengeId),
  ],
);

export const skills = pgTable(
  "skills",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull().default("general"),
    maxTier: integer("max_tier").notNull().default(1),
    effects: jsonb("effects").notNull().default({}),
    isPassive: boolean("is_passive").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("skills_name_unique").on(table.name)],
);

export const skillUnlocks = pgTable(
  "skill_unlocks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    tier: integer("tier").notNull().default(1),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("skill_unlocks_user_skill_unique").on(table.userId, table.skillId)],
);

export const currencies = pgTable(
  "currencies",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bytes: integer("bytes").notNull().default(0),
    focus: integer("focus").notNull().default(0),
    commits: integer("commits").notNull().default(0),
    gold: integer("gold").notNull().default(0),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("currencies_user_unique").on(table.userId)],
);

export const characterVessels = pgTable(
  "character_vessels",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bodyType: text("body_type").notNull(),
    skinTone: text("skin_tone").notNull(),
    hairStyle: text("hair_style").notNull(),
    hairColor: text("hair_color").notNull(),
    eyeStyle: text("eye_style"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("character_vessels_user_unique").on(table.userId)],
);

export const relics = pgTable(
  "relics",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    slot: text("slot").notNull(),
    rarity: text("rarity").notNull(),
    priceGold: integer("price_gold").notNull().default(0),
    unlockCondition: text("unlock_condition"),
    requiresSkillId: text("requires_skill_id"),
    isLimited: boolean("is_limited").notNull().default(false),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("relics_slot_idx").on(table.slot), index("relics_rarity_idx").on(table.rarity)],
);

export const relicInventory = pgTable(
  "relic_inventory",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relicId: text("relic_id")
      .notNull()
      .references(() => relics.id, { onDelete: "cascade" }),
    acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("relic_inventory_user_relic_unique").on(table.userId, table.relicId),
    index("relic_inventory_user_idx").on(table.userId),
  ],
);

export const relicBindings = pgTable(
  "relic_bindings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relicId: text("relic_id")
      .notNull()
      .references(() => relics.id, { onDelete: "cascade" }),
    slot: text("slot").notNull(),
    boundAt: timestamp("bound_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("relic_bindings_user_slot_unique").on(table.userId, table.slot),
    uniqueIndex("relic_bindings_user_relic_unique").on(table.userId, table.relicId),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerRef: text("provider_ref").notNull(),
    status: text("status").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("purchases_provider_ref_unique").on(table.providerRef),
    index("purchases_user_id_idx").on(table.userId),
  ],
);

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: text("id").primaryKey(),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("admin_audit_logs_admin_id_idx").on(table.adminUserId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  skillUnlocks: many(skillUnlocks),
  challengeRuns: many(challengeRuns),
  relicInventory: many(relicInventory),
  relicBindings: many(relicBindings),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const challengeRunsRelations = relations(challengeRuns, ({ one }) => ({
  user: one(users, {
    fields: [challengeRuns.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [challengeRuns.challengeId],
    references: [challenges.id],
  }),
}));

export const skillUnlocksRelations = relations(skillUnlocks, ({ one }) => ({
  user: one(users, {
    fields: [skillUnlocks.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [skillUnlocks.skillId],
    references: [skills.id],
  }),
}));

export const characterVesselsRelations = relations(characterVessels, ({ one }) => ({
  user: one(users, {
    fields: [characterVessels.userId],
    references: [users.id],
  }),
}));

export const relicsRelations = relations(relics, ({ many }) => ({
  inventory: many(relicInventory),
  bindings: many(relicBindings),
}));

export const relicInventoryRelations = relations(relicInventory, ({ one }) => ({
  user: one(users, {
    fields: [relicInventory.userId],
    references: [users.id],
  }),
  relic: one(relics, {
    fields: [relicInventory.relicId],
    references: [relics.id],
  }),
}));

export const relicBindingsRelations = relations(relicBindings, ({ one }) => ({
  user: one(users, {
    fields: [relicBindings.userId],
    references: [users.id],
  }),
  relic: one(relics, {
    fields: [relicBindings.relicId],
    references: [relics.id],
  }),
}));
