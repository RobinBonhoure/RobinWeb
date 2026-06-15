import type { Education } from "@/db/schema";

interface Props {
  educations: Education[];
  locale: string;
}

export function EducationsSection({ educations, locale }: Props) {
  return (
    <section id="formations" className="px-6 md:px-16 lg:px-24 py-24 border-t border-border bg-secondary/20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xs font-medium tracking-[0.25em] uppercase text-muted-foreground mb-16">
          {locale === "fr" ? "Formations" : "Education"}
        </h2>
        <div className="space-y-0">
          {educations.map((edu) => {
            const title = locale === "fr" ? edu.titleFr : edu.titleEn;
            const detail = locale === "fr" ? edu.detailFr : edu.detailEn;
            return (
              <div
                key={edu.id}
                className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-4 md:gap-12 py-8 border-t border-border"
              >
                <p className="text-sm font-medium text-muted-foreground tabular-nums">{edu.period}</p>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{edu.school}</p>
                  {detail && <p className="text-sm text-muted-foreground/70 mt-1">{detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
