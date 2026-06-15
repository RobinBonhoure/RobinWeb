import type { Experience } from "@/db/schema";

interface Props {
  experiences: Experience[];
  locale: string;
}

export function ExperiencesSection({ experiences, locale }: Props) {
  return (
    <section id="experiences" className="px-6 md:px-16 lg:px-24 py-24 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xs font-medium tracking-[0.25em] uppercase text-muted-foreground mb-16">
          {locale === "fr" ? "Expériences" : "Experience"}
        </h2>
        <div className="space-y-0">
          {experiences.map((exp, i) => {
            const role = locale === "fr" ? exp.roleFr : exp.roleEn;
            const bullets = locale === "fr" ? exp.bulletsFr : exp.bulletsEn;
            return (
              <div
                key={exp.id}
                className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-4 md:gap-12 py-10 border-t border-border group"
              >
                <div className="shrink-0 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground tabular-nums">{exp.period}</p>
                  {exp.location && (
                    <p className="text-xs text-muted-foreground/60">{exp.location}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold leading-tight">{role}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="space-y-1.5">
                      {bullets.map((b, j) => (
                        <li key={j} className="flex gap-3 text-sm text-muted-foreground">
                          <span className="mt-2 size-1 rounded-full bg-muted-foreground shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
