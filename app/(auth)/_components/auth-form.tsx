"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const endpoint = useMemo(
    () => (isSignup ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email"),
    [isSignup],
  );

  const submitLabel = isSignup ? "Create account" : "Sign in";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      email,
      password,
      callbackURL: callbackUrl,
    };

    if (isSignup) {
      payload.name = name;
    } else {
      payload.rememberMe = rememberMe;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.message ?? data?.error ?? "Unable to continue. Try again.";
        setError(message);
        setIsSubmitting(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please retry.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignup
            ? "Join Arbre and start your first debugging run."
            : "Sign in to continue your progress."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignup ? (
          <label className="block space-y-2 text-sm">
            <span className="text-foreground">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ada Lovelace"
              required
              className="w-full rounded-lg border border-border bg-background/70 px-4 py-2 text-foreground outline-none transition focus:border-ring"
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-sm">
          <span className="text-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@arbre.dev"
            required
            className="w-full rounded-lg border border-border bg-background/70 px-4 py-2 text-foreground outline-none transition focus:border-ring"
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="text-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isSignup ? "Minimum 10 characters" : "Your password"}
            required
            minLength={10}
            className="w-full rounded-lg border border-border bg-background/70 px-4 py-2 text-foreground outline-none transition focus:border-ring"
          />
        </label>

        {!isSignup ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-border bg-background text-primary"
            />
            Keep me signed in
          </label>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Working..." : submitLabel}
        </button>
      </form>

      <div className="text-xs text-muted-foreground">
        {isSignup ? (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        ) : (
          <p>
            New here?{" "}
            <Link href="/signup" className="text-primary hover:text-primary/80">
              Create an account
            </Link>
          </p>
        )}
      </div>

      {isSignup ? (
        <p className="text-xs text-muted-foreground">
          Verification is required. We will email a link to confirm your address before you can sign
          in.
        </p>
      ) : null}
    </div>
  );
}
