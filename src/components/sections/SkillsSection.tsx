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

  const otherCategories = ["fonctionnel", "qualite"].filter(
    (c) => byCategory[c]?.length,
  );

  return (
    <>
      {/* Fonctionnel + Qualités */}
      {otherCategories.length > 0 && (
        <section className="px-6 md:px-16 lg:px-24 py-24 bg-secondary/20">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
            {otherCategories.map((cat, i) => (
              <RevealOnScroll key={cat} delay={i * 0.12}>
                <div>
                  <h2 className="text-label text-muted-foreground mb-8">
                    {locale === "fr"
                      ? CATEGORY_HEADINGS[cat]?.fr
                      : CATEGORY_HEADINGS[cat]?.en}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {(byCategory[cat] ?? []).map((s) => (
                      <span
                        key={s.id}
                        className="neon-tag-hover inline-flex items-center border border-border px-4 py-2 text-sm font-medium rounded-md"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
