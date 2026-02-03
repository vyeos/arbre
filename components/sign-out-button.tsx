"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

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
    <Button
      variant="destructive"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="cursor-pointer text-xs font-semibold transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSigningOut ? "Unbinding..." : "Unbind Sigil"}
    </Button>
  );
}
