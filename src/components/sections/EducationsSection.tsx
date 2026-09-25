import type { Education } from "@/db/schema";
import { RevealOnScroll } from "@/components/layout/RevealOnScroll";

interface Props {
  educations: Education[];
  locale: string;
}

export function EducationsSection({ educations, locale }: Props) {
  return (
    <section
      id="formations"
      className="px-6 md:px-16 lg:px-24 py-24 bg-secondary/20"
    >
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <h2 className="text-label text-muted-foreground mb-16">
            {locale === "fr" ? "Formations" : "Education"}
          </h2>
        </RevealOnScroll>
        <div className="space-y-0">
          {educations.map((edu, i) => {
            const title = locale === "fr" ? edu.titleFr : edu.titleEn;
            const detail = locale === "fr" ? edu.detailFr : edu.detailEn;
            return (
              <RevealOnScroll key={edu.id} delay={i * 0.07}>
                <div className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-4 md:gap-12 py-8 border-t border-border">
                  <div className="shrink-0 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground tabular-nums">
                      {edu.period}
                    </p>
                    {edu.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {edu.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground/70 dark:text-black/100 border border-border/50 dark:border-white/[0.08] px-2.5 py-1 rounded-sm bg-background/80 dark:bg-white/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.school}
                    </p>
                    {detail && (
                      <p className="text-sm text-muted-foreground/70 mt-1 whitespace-pre-line">
                        {detail}
                      </p>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
