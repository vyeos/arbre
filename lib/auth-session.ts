import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getSession() {
  const headerList = await headers();
  return auth.api.getSession({ headers: headerList });
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export function isAdmin(user: { role?: string | null } | null | undefined) {
  return user?.role === "admin";
}
