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

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    image: text("image"),
    role: userRoleEnum("role").notNull().default("player"),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerAccountIdx: uniqueIndex("accounts_provider_account_unique").on(
      table.provider,
      table.providerAccountId,
    ),
    userIdx: index("accounts_user_id_idx").on(table.userId),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    identifierIdx: index("verification_tokens_identifier_idx").on(table.identifier),
  }),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    credentialIdx: uniqueIndex("authenticators_credential_unique").on(table.credentialId),
    userIdx: index("authenticators_user_id_idx").on(table.userId),
  }),
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
    lastPlayedAt: timestamp("last_played_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex("user_progress_user_unique").on(table.userId),
  }),
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
    serverHealthDrainRate: integer("server_health_drain_rate").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("challenges_slug_unique").on(table.slug),
    languageIdx: index("challenges_language_idx").on(table.language),
  }),
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
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    logs: jsonb("logs").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("challenge_runs_user_id_idx").on(table.userId),
    challengeIdx: index("challenge_runs_challenge_id_idx").on(table.challengeId),
  }),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: uniqueIndex("skills_name_unique").on(table.name),
  }),
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
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userSkillIdx: uniqueIndex("skill_unlocks_user_skill_unique").on(table.userId, table.skillId),
  }),
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
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex("currencies_user_unique").on(table.userId),
  }),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerRefIdx: uniqueIndex("purchases_provider_ref_unique").on(table.providerRef),
    userIdx: index("purchases_user_id_idx").on(table.userId),
  }),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    adminIdx: index("admin_audit_logs_admin_id_idx").on(table.adminUserId),
  }),
);
