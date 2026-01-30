import { randomUUID } from "crypto";

import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";

export type AdminAuditInput = {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAdminAction({
  adminUserId,
  action,
  targetType,
  targetId,
  metadata,
}: AdminAuditInput) {
  await db.insert(adminAuditLogs).values({
    id: randomUUID(),
    adminUserId,
    action,
    targetType,
    targetId: targetId ?? null,
    metadata: metadata ?? {},
    createdAt: new Date(),
  });
}
