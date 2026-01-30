import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { logAdminAction } from "@/lib/admin-audit";
import { getSession, isAdmin } from "@/lib/auth-session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(100);

  await logAdminAction({
    adminUserId: session.user.id,
    action: "view_audit_logs",
    targetType: "admin_audit_logs",
    metadata: { limit: 100 },
  });

  return NextResponse.json({ logs });
}
