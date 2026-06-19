import Image from "next/image";
import type { Project } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { GitFork } from "lucide-react";
import { RevealOnScroll } from "@/components/layout/RevealOnScroll";

interface Props {
  projects: Project[];
  locale: string;
}

export function ProjectsSection({ projects, locale }: Props) {
  if (projects.length === 0) return null;

  return (
    <section id="projets" className="px-6 md:px-16 lg:px-24 py-24">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <h2 className="text-label text-muted-foreground mb-16">
            {locale === "fr" ? "Projets" : "Projects"}
          </h2>
        </RevealOnScroll>
        <div className="grid md:grid-cols-2 gap-px">
          {projects.map((project, i) => {
            const title = locale === "fr" ? project.titleFr : project.titleEn;
            const desc = locale === "fr" ? project.descFr : project.descEn;
            return (
              <RevealOnScroll key={project.id} delay={i * 0.08}>
                <article className="neon-card-hover group relative p-8 flex flex-col gap-5 h-full">
                  {project.imageUrl && (
                    <div className="relative aspect-video overflow-hidden bg-secondary">
                      <Image
                        src={project.imageUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-lg leading-tight">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline after:absolute after:inset-0"
                          >
                            {title}
                          </a>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0 relative z-10">
                        {project.repoUrl && (
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={
                              locale === "fr" ? "Voir le code" : "View code"
                            }
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <GitFork className="size-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {desc}
                    </p>
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
