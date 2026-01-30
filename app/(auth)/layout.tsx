import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl">{children}</div>
      </div>
    </div>
  );
}
