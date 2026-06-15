import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** Returns the current Better Auth session, or null if not authenticated. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Throws if there is no authenticated session. Use at the top of every
 * mutating Server Action — never assume `/admin` placement protects it.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
