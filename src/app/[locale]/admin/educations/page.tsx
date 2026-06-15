import { asc } from "drizzle-orm";
import { db } from "@/db";
import { educations } from "@/db/schema";
import { EducationList } from "@/components/admin/EducationList";

export default async function AdminEducationsPage() {
  const items = await db.select().from(educations).orderBy(asc(educations.order));
  return <EducationList initial={items} />;
}
