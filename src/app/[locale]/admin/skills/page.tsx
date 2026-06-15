import { asc } from "drizzle-orm";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { SkillList } from "@/components/admin/SkillList";

export default async function AdminSkillsPage() {
  const items = await db.select().from(skills).orderBy(asc(skills.order));
  return <SkillList initial={items} />;
}
