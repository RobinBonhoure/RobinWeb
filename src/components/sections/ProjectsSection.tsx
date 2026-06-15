import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitFork } from "lucide-react";

interface Props {
  projects: Project[];
  locale: string;
}

export function ProjectsSection({ projects, locale }: Props) {
  if (projects.length === 0) return null;

  return (
    <section id="projets" className="px-6 md:px-16 lg:px-24 py-24 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xs font-medium tracking-[0.25em] uppercase text-muted-foreground mb-16">
          {locale === "fr" ? "Projets" : "Projects"}
        </h2>
        <div className="grid md:grid-cols-2 gap-px bg-border">
          {projects.map((project) => {
            const title = locale === "fr" ? project.titleFr : project.titleEn;
            const desc = locale === "fr" ? project.descFr : project.descEn;
            const href = locale === "fr"
              ? `/projets/${project.slug}`
              : `/en/projets/${project.slug}`;
            return (
              <article
                key={project.id}
                className="group relative bg-background p-8 flex flex-col gap-5"
              >
                {project.imageUrl && (
                  <div className="relative aspect-video overflow-hidden bg-secondary">
                    <Image
                      src={project.imageUrl}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg leading-tight">
                      <Link href={href} className="hover:underline after:absolute after:inset-0">
                        {title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 relative z-10">
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noreferrer" aria-label="Voir le site" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                      {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noreferrer" aria-label="Voir le code" className="text-muted-foreground hover:text-foreground">
                          <GitFork className="size-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{desc}</p>
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
