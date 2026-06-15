"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { profileSchema } from "@/lib/validators/profile";
import { eq } from "drizzle-orm";

export async function updateProfile(id: number, data: unknown) {
  await requireSession();
  const parsed = profileSchema.parse(data);
  await db
    .update(profile)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(profile.id, id));
  revalidatePath("/admin/profile");
  revalidatePath("/");
}
