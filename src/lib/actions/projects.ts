"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { projectSchema } from "@/lib/validators/project";

export async function createProject(data: unknown) {
  await requireSession();
  const parsed = projectSchema.parse(data);
  await db.insert(projects).values(parsed);
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function updateProject(id: number, data: unknown) {
  await requireSession();
  const parsed = projectSchema.parse(data);
  await db.update(projects).set({ ...parsed, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function deleteProject(id: number) {
  await requireSession();
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function reorderProjects(ordered: { id: number; order: number }[]) {
  await requireSession();
  await Promise.all(
    ordered.map(({ id, order }) =>
      db.update(projects).set({ order, updatedAt: new Date() }).where(eq(projects.id, id))
    )
  );
  revalidatePath("/admin/projects");
  revalidatePath("/");
}
