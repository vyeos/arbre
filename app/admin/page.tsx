import Link from "next/link";

import { getCurrentUser, isAdmin } from "@/lib/auth-session";
import AdminDashboard from "./_components/admin-dashboard";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Admin Sanctum
            </p>
            <h1 className="text-3xl font-semibold">Gate Sealed</h1>
            <p className="text-sm text-muted-foreground">
              Only Admin sigils may pass. Return to the Character Overview.
            </p>
          </header>
          <Link
            href="/"
            className="w-fit rounded-lg border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/60"
          >
            Return to Overview
          </Link>
        </main>
      </div>
    );
  }

  return <AdminDashboard />;
}
