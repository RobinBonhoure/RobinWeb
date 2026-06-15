"use client";

import { createAuthClient } from "better-auth/react";

// baseURL defaults to the current origin in the browser, so no extra env var
// is needed for a single-domain deployment.
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
