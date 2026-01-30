"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error("Sign out error:", response.status, data);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
      router.refresh();
      router.push("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="rounded-lg border border-border bg-card/70 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSigningOut ? "Unbinding..." : "Unbind Sigil"}
    </button>
  );
}
