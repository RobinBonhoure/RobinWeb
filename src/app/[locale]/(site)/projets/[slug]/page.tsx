import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitFork, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  if (!project) return {};
  return {
    title: locale === "fr" ? project.titleFr : project.titleEn,
    description: locale === "fr" ? project.descFr.slice(0, 160) : project.descEn.slice(0, 160),
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  if (!project) notFound();

  const title = locale === "fr" ? project.titleFr : project.titleEn;
  const desc = locale === "fr" ? project.descFr : project.descEn;
  const backHref = locale === "fr" ? "/#projets" : "/en/#projets";

  return (
    <main className="min-h-screen px-6 md:px-16 lg:px-24 py-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {locale === "fr" ? "Retour aux projets" : "Back to projects"}
        </Link>

        {project.imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <Image src={project.imageUrl} alt={title} fill className="object-cover" priority />
          </div>
        )}

        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{desc}</p>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-10 bg-foreground text-background px-5 text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                <ExternalLink className="size-4" />
                {locale === "fr" ? "Voir le site" : "View site"}
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-10 border border-border px-5 text-sm font-medium hover:bg-accent transition-colors"
              >
                <GitFork className="size-4" />
                {locale === "fr" ? "Voir le code" : "View code"}
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
