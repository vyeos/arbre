import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type {
  challenges,
  challengeRuns,
  skills,
  skillUnlocks,
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
  userProgress,
  currencies,
  purchases,
  adminAuditLogs,
} from "@/db/schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Account = InferSelectModel<typeof accounts>;
export type Session = InferSelectModel<typeof sessions>;
export type VerificationToken = InferSelectModel<typeof verificationTokens>;
export type Authenticator = InferSelectModel<typeof authenticators>;

export type Challenge = InferSelectModel<typeof challenges>;
export type NewChallenge = InferInsertModel<typeof challenges>;

export type ChallengeRun = InferSelectModel<typeof challengeRuns>;
export type Skill = InferSelectModel<typeof skills>;
export type SkillUnlock = InferSelectModel<typeof skillUnlocks>;
export type UserProgress = InferSelectModel<typeof userProgress>;
export type Currency = InferSelectModel<typeof currencies>;
export type Purchase = InferSelectModel<typeof purchases>;
export type AdminAuditLog = InferSelectModel<typeof adminAuditLogs>;
