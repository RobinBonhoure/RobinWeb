import { asc } from "drizzle-orm";
import { db } from "@/db";
import { experiences } from "@/db/schema";
import { ExperienceList } from "@/components/admin/ExperienceList";

export default async function AdminExperiencesPage() {
  const items = await db
    .select()
    .from(experiences)
    .orderBy(asc(experiences.order));

  return <ExperienceList initial={items} />;
}
