"use client";

/**
 * GameMount — the single integration point for the « Stack your skills » game.
 *
 * Replace the content of this file (or swap to a different component) to swap
 * the game without touching the rest of the site. Props contract is stable:
 *   skills  — list of skill names shown as block labels
 *   locale  — current locale (for UI strings)
 *
 * Phase 8 will replace the placeholder below with the actual R3F + Rapier scene.
 */

interface Props {
  skills: string[];
  locale: string;
}

export default function GameMount({ skills, locale }: Props) {
  // Phase 8 placeholder — replaced by the real R3F/Rapier game.
  return (
    <div className="flex items-center justify-center h-72 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {locale === "fr" ? "Jeu 3D — bientôt disponible" : "3D game — coming soon"}
      <span className="sr-only">{skills.join(", ")}</span>
    </div>
  );
}
