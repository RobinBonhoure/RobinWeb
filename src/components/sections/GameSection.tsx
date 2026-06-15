"use client";

/**
 * Wrapper section for the « Stack your skills » mini-game.
 * The actual game component (Phase 8) is mounted here via dynamic import.
 * Swapping the game = replace only the GameMount component.
 */
import dynamic from "next/dynamic";

const GameMount = dynamic(() => import("@/components/game/StackSkills/GameMount"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
      Chargement du jeu…
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
        <h2 className="text-xs font-medium tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Stack your skills
        </h2>
        <p className="text-sm text-muted-foreground mb-10">
          {locale === "fr"
            ? "Empilez les blocs et construisez la tour la plus haute."
            : "Stack the blocks and build the tallest tower."}
        </p>
        <GameMount skills={skills} locale={locale} />
      </div>
    </section>
  );
}
