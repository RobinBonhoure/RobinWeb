import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

/**
 * Better Auth server instance.
 *
 * Single-admin setup: email + password only, public sign-up disabled. The admin
 * account is created via `src/db/seed.ts`, never through a public route.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  // Makes Better Auth set cookies from within Next.js Server Actions.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
