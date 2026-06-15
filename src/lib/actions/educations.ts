"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { educations } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { educationSchema } from "@/lib/validators/education";

export async function createEducation(data: unknown) {
  await requireSession();
  const parsed = educationSchema.parse(data);
  await db.insert(educations).values(parsed);
  revalidatePath("/admin/educations");
  revalidatePath("/");
}

export async function updateEducation(id: number, data: unknown) {
  await requireSession();
  const parsed = educationSchema.parse(data);
  await db.update(educations).set({ ...parsed, updatedAt: new Date() }).where(eq(educations.id, id));
  revalidatePath("/admin/educations");
  revalidatePath("/");
}

export async function deleteEducation(id: number) {
  await requireSession();
  await db.delete(educations).where(eq(educations.id, id));
  revalidatePath("/admin/educations");
  revalidatePath("/");
}

export async function reorderEducations(ordered: { id: number; order: number }[]) {
  await requireSession();
  await Promise.all(
    ordered.map(({ id, order }) =>
      db.update(educations).set({ order, updatedAt: new Date() }).where(eq(educations.id, id))
    )
  );
  revalidatePath("/admin/educations");
  revalidatePath("/");
}
