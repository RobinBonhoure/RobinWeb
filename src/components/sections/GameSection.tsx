"use client";

import dynamic from "next/dynamic";
import { RevealOnScroll } from "@/components/layout/RevealOnScroll";

const GameMount = dynamic(() => import("@/components/game/StackSkills/GameMount"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
      {typeof window !== "undefined" && document.documentElement.lang === "en"
        ? "Loading game…"
        : "Chargement du jeu…"}
    </div>
  ),
});

interface Props {
  skills: string[];
  locale: string;
}

export function GameSection({ skills, locale }: Props) {
  return (
    <section className="px-6 md:px-16 lg:px-24 py-24 border-t border-border bg-secondary/20">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <div className="mb-10">
            <h2 className="text-label text-muted-foreground mb-4">Stack your skills</h2>
            <p className="text-sm text-muted-foreground">
              {locale === "fr"
                ? "Empilez les blocs et construisez la tour la plus haute."
                : "Stack the blocks and build the tallest tower."}
            </p>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.15}>
          <GameMount skills={skills} locale={locale} />
        </RevealOnScroll>
      </div>
    </section>
  );
}
