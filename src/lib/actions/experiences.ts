"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { experiences } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { experienceSchema } from "@/lib/validators/experience";

export async function createExperience(data: unknown) {
  await requireSession();
  const parsed = experienceSchema.parse(data);
  await db.insert(experiences).values(parsed);
  revalidatePath("/admin/experiences");
  revalidatePath("/");
}

export async function updateExperience(id: number, data: unknown) {
  await requireSession();
  const parsed = experienceSchema.parse(data);
  await db.update(experiences).set({ ...parsed, updatedAt: new Date() }).where(eq(experiences.id, id));
  revalidatePath("/admin/experiences");
  revalidatePath("/");
}

export async function deleteExperience(id: number) {
  await requireSession();
  await db.delete(experiences).where(eq(experiences.id, id));
  revalidatePath("/admin/experiences");
  revalidatePath("/");
}

/** Bulk update `order` values after drag-and-drop reordering. */
export async function reorderExperiences(ordered: { id: number; order: number }[]) {
  await requireSession();
  await Promise.all(
    ordered.map(({ id, order }) =>
      db.update(experiences).set({ order, updatedAt: new Date() }).where(eq(experiences.id, id))
    )
  );
  revalidatePath("/admin/experiences");
  revalidatePath("/");
}
