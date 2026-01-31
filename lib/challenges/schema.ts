import { z } from "zod";

export const challengeSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  language: z.string().min(1),
  bugTier: z.string().min(1),
  starterCode: z.string().min(1),
  constraints: z.record(z.string(), z.unknown()).default({}),
  rewards: z.record(z.string(), z.unknown()).default({}),
  serverHealthDrainRate: z.number().int().min(1).default(1),
  codexLink: z.string().url().nullable().optional(),
});

export const challengeListSchema = z.array(challengeSchema);

export type ChallengeDefinition = z.infer<typeof challengeSchema>;
