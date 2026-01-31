import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import * as schema from "@/db/schema";

const isProduction = process.env.NODE_ENV === "production";

const trustedOrigins = (() => {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  const list = raw
    ? raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  if (process.env.NEXT_PUBLIC_APP_URL) {
    list.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  return Array.from(new Set(list));
})();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    // requireEmailVerification: true,
  },
  //   emailVerification: {
  //     sendOnSignUp: true,
  //     sendVerificationEmail: async ({ user, url }) => {
  //       if (isProduction && !process.env.AUTH_EMAIL_FROM) {
  //         throw new Error("AUTH_EMAIL_FROM is required for email verification in production.");
  //       }

  //       if (!process.env.AUTH_EMAIL_FROM) {
  //         console.info("Verification email not sent. Configure AUTH_EMAIL_FROM to enable email delivery.");
  //         console.info(`Verify ${user.email} via: ${url}`);
  //         return;
  //       }

  //       console.info(`Verification email for ${user.email} should be sent from ${process.env.AUTH_EMAIL_FROM}.`);
  //       console.info(`Verification URL: ${url}`);
  //     },
  //   },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "player",
      },
    },
  },
  account: {
    modelName: "accounts",
  },
  session: {
    modelName: "sessions",
  },
  verification: {
    modelName: "verificationTokens",
  },
  plugins: [nextCookies()],
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
    },
  },
});
