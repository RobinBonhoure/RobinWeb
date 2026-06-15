import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { user } from "./auth-schema";
import { seedContent } from "./seed-content";

/**
 * Seed runner. Env is loaded by `tsx --env-file=.env.local` (see package.json).
 *
 * The production auth instance (src/lib/auth.ts) disables public sign-up, so we
 * build a dedicated instance here with sign-up enabled purely to create the
 * single admin account. Idempotent: skips if the admin already exists.
 */
const seedAuth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  }

  const existing = await db.select().from(user).where(eq(user.email, email));
  if (existing.length > 0) {
    console.log(`✓ Admin already exists: ${email}`);
    return;
  }

  await seedAuth.api.signUpEmail({
    body: { email, password, name: "Robin Bonhoure" },
  });
  console.log(`✓ Admin account created: ${email}`);
}

async function main() {
  console.log("Seeding database…");
  await seedAdmin();
  await seedContent();
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
