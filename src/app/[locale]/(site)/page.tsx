import { asc } from "drizzle-orm";
import { db } from "@/db";
import { profile, experiences, educations, skills, projects } from "@/db/schema";
import { notFound } from "next/navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { ExperiencesSection } from "@/components/sections/ExperiencesSection";
import { EducationsSection } from "@/components/sections/EducationsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { GameSection } from "@/components/sections/GameSection";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [p] = await db.select().from(profile).limit(1);
  return {
    title: p?.name ?? "Robin Bonhoure",
    description: locale === "fr" ? p?.aboutFr?.slice(0, 160) : p?.aboutEn?.slice(0, 160),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [
    [profileData],
    experiencesData,
    educationsData,
    skillsData,
    projectsData,
  ] = await Promise.all([
    db.select().from(profile).limit(1),
    db.select().from(experiences).orderBy(asc(experiences.order)),
    db.select().from(educations).orderBy(asc(educations.order)),
    db.select().from(skills).orderBy(asc(skills.order)),
    db.select().from(projects).orderBy(asc(projects.order)),
  ]);

  if (!profileData) notFound();

  const stackSkillNames = skillsData
    .filter((s) => s.category === "stack")
    .map((s) => s.name);

  return (
    <main>
      <HeroSection profile={profileData} locale={locale} />
      <ExperiencesSection experiences={experiencesData} locale={locale} />
      <EducationsSection educations={educationsData} locale={locale} />
      <SkillsSection skills={skillsData} locale={locale} />
      <ProjectsSection projects={projectsData} locale={locale} />
      <GameSection skills={stackSkillNames} locale={locale} />
    </main>
  );
}
