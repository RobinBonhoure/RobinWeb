import type { Skill } from "@/db/schema";
import { RevealOnScroll } from "@/components/layout/RevealOnScroll";

interface Props {
  skills: Skill[];
  locale: string;
}

const CATEGORY_HEADINGS: Record<string, { fr: string; en: string }> = {
  stack: { fr: "Stack technique", en: "Tech stack" },
  fonctionnel: { fr: "Fonctionnel", en: "Functional" },
  qualite: { fr: "Qualités", en: "Qualities" },
};

export function SkillsSection({ skills, locale }: Props) {
  const byCategory = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const stackSkills = byCategory["stack"] ?? [];
  const otherCategories = ["fonctionnel", "qualite"].filter((c) => byCategory[c]?.length);

  return (
    <>
      {/* Stack — full width with tags */}
      <section id="stack" className="px-6 md:px-16 lg:px-24 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-label text-muted-foreground mb-12">Stack</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <div className="flex flex-wrap gap-3">
              {stackSkills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center border border-border px-4 py-2 text-sm font-medium rounded-md"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Fonctionnel + Qualités */}
      {otherCategories.length > 0 && (
        <section className="px-6 md:px-16 lg:px-24 py-24 border-t border-border bg-secondary/20">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
            {otherCategories.map((cat, i) => (
              <RevealOnScroll key={cat} delay={i * 0.12}>
                <div>
                  <h2 className="text-label text-muted-foreground mb-8">
                    {locale === "fr"
                      ? CATEGORY_HEADINGS[cat]?.fr
                      : CATEGORY_HEADINGS[cat]?.en}
                  </h2>
                  <ul className="space-y-3">
                    {(byCategory[cat] ?? []).map((s) => (
                      <li key={s.id} className="flex items-center gap-3 text-sm">
                        <span className="size-1.5 rounded-full bg-foreground shrink-0" />
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
