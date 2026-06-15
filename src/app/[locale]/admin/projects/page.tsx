import { asc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { ProjectList } from "@/components/admin/ProjectList";

export default async function AdminProjectsPage() {
  const items = await db.select().from(projects).orderBy(asc(projects.order));
  return <ProjectList initial={items} />;
}
