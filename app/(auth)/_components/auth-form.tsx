"use client";

import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
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

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === "signup";
  const endpoint = useMemo(
    () => (isSignup ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email"),
    [isSignup],
  );

  const submitLabel = isSignup ? "Forge Character Vessel" : "Enter the Gate";

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rememberMe: true,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      const payload: Record<string, unknown> = {
        email: value.email,
        password: value.password,
        callbackURL: callbackUrl,
      };

      if (isSignup) {
        payload.name = value.name;
      } else {
        payload.rememberMe = value.rememberMe;
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
          const message =
            data?.message ?? data?.error ?? "The system destabilized. Try again, Player.";
          setError(message);
          return;
        }

        router.push(callbackUrl);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("The system destabilized. Please retry, Player.");
      }
    },
  });

  const isSubmitting = form.state.isSubmitting;

  const nameValidator = isSignup
    ? ({ value }: { value: string }) =>
        value.trim().length ? undefined : "Player name is required."
    : undefined;
  const emailValidator = ({ value }: { value: string }) => {
    if (!value.trim()) {
      return "Codex email is required.";
    }
    const isValid = /.+@.+\..+/.test(value);
    return isValid ? undefined : "Enter a valid codex email.";
  };
  const passwordValidator = ({ value }: { value: string }) => {
    if (!value) {
      return "Sigil key is required.";
    }
    return value.length >= 10 ? undefined : "Sigil key must be at least 10 characters.";
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">
          {isSignup ? "Forge your Character Vessel" : "Welcome back, Player"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignup
            ? "Bind your identity and begin your first Quest."
            : "Enter the Gate to continue your ascent."}
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-5"
      >
        {isSignup ? (
          <form.Field
            name="name"
            validators={nameValidator ? { onChange: nameValidator } : undefined}
          >
            {(field) => (
              <label className="block space-y-2 text-sm">
                <span className="text-foreground">Player Name</span>
                <input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Ada the Swift"
                  required
                  className="w-full rounded-lg border border-border bg-background/70 px-4 py-2 text-foreground outline-none transition focus:border-ring"
                />
                {field.state.meta.isTouched && field.state.meta.errors?.length ? (
                  <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>
                ) : null}
              </label>
            )}
          </form.Field>
        ) : null}

        <form.Field name="email" validators={{ onChange: emailValidator }}>
          {(field) => (
            <label className="block space-y-2 text-sm">
              <span className="text-foreground">Codex Email</span>
              <input
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                }}
                placeholder="player@arbre.dev"
                required
                className="w-full rounded-lg border border-border bg-background/70 px-4 py-2 text-foreground outline-none transition focus:border-ring"
              />
              {field.state.meta.isTouched && field.state.meta.errors?.length ? (
                <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>
              ) : null}
            </label>
          )}
        </form.Field>

        <form.Field name="password" validators={{ onChange: passwordValidator }}>
          {(field) => (
            <label className="block space-y-2 text-sm">
              <span className="text-foreground">Sigil Key</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  placeholder={isSignup ? "Minimum 10 characters" : "Your sigil key"}
                  required
                  minLength={10}
                  className="w-full rounded-lg border border-border bg-background/70 px-4 py-2 pr-12 text-foreground outline-none transition focus:border-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {field.state.meta.isTouched && field.state.meta.errors?.length ? (
                <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>
              ) : null}
            </label>
          )}
        </form.Field>

        {!isSignup ? (
          <form.Field name="rememberMe">
            {(field) => (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.checked);
                  }}
                  className="h-4 w-4 rounded border-border bg-background text-primary"
                />
                Keep my sigil bound
              </label>
            )}
          </form.Field>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                role="status"
                aria-label="Channeling"
              />
            ) : null}
            {isSubmitting ? "Channeling..." : submitLabel}
          </span>
        </button>
      </form>

      <div className="text-xs text-muted-foreground">
        {isSignup ? (
          <p>
            Already have a Character Vessel?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80">
              Enter the Gate
            </Link>
          </p>
        ) : (
          <p>
            New Player?{" "}
            <Link href="/signup" className="text-primary hover:text-primary/80">
              Forge a Character Vessel
            </Link>
          </p>
        )}
      </div>

      {isSignup ? (
        <p className="text-xs text-muted-foreground">
          Verification is required. We will send a sigil link to confirm your codex email before you
          can enter the Gate.
        </p>
      ) : null}
    </div>
  );
}
