"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { skillSchema } from "@/lib/validators/skill";

export async function createSkill(data: unknown) {
  await requireSession();
  const parsed = skillSchema.parse(data);
  await db.insert(skills).values(parsed);
  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function updateSkill(id: number, data: unknown) {
  await requireSession();
  const parsed = skillSchema.parse(data);
  await db.update(skills).set({ ...parsed, updatedAt: new Date() }).where(eq(skills.id, id));
  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function deleteSkill(id: number) {
  await requireSession();
  await db.delete(skills).where(eq(skills.id, id));
  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function reorderSkills(ordered: { id: number; order: number }[]) {
  await requireSession();
  await Promise.all(
    ordered.map(({ id, order }) =>
      db.update(skills).set({ order, updatedAt: new Date() }).where(eq(skills.id, id))
    )
  );
  revalidatePath("/admin/skills");
  revalidatePath("/");
}
