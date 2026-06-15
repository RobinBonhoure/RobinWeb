import Link from "next/link";
import type { Profile } from "@/db/schema";

interface Props {
  profile: Profile;
  locale: string;
}

export function HeroSection({ profile, locale }: Props) {
  const title = locale === "fr" ? profile.titleFr : profile.titleEn;

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 overflow-hidden"
    >
      {/* Swiss-grid decorative rule */}
      <div className="absolute inset-y-0 left-0 w-px bg-border" aria-hidden />
      <div className="absolute inset-y-0 right-0 w-px bg-border" aria-hidden />

      <div className="max-w-4xl space-y-8 relative z-10">
        {/* Eyebrow */}
        <p className="text-xs font-medium tracking-[0.25em] uppercase text-muted-foreground">
          Portfolio — {new Date().getFullYear()}
        </p>

        {/* Name — display headline */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] text-foreground">
          {profile.name.split(" ")[0]}
          <br />
          <span className="font-light">{profile.name.split(" ").slice(1).join(" ")}</span>
        </h1>

        {/* Title */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">{title}</p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Link
            href="#projets"
            className="inline-flex h-11 items-center gap-2 bg-foreground text-background px-6 text-sm font-medium tracking-wide hover:bg-foreground/90 transition-colors"
          >
            {locale === "fr" ? "Voir mes projets" : "View my projects"}
          </Link>
          {profile.cvPdfUrl && (
            <a
              href={profile.cvPdfUrl}
              download
              className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium tracking-wide hover:bg-accent transition-colors"
            >
              {locale === "fr" ? "Télécharger mon CV" : "Download my CV"}
            </a>
          )}
        </div>
      </div>

      {/* Location + contact line */}
      <div className="absolute bottom-8 left-6 md:left-16 lg:left-24 flex items-center gap-6 text-xs text-muted-foreground">
        {profile.location && <span>{profile.location}</span>}
        <a href={`mailto:${profile.email}`} className="hover:text-foreground transition-colors">
          {profile.email}
        </a>
      </div>

      {/* 3D hero placeholder — replaced in Phase 8 */}
      <div
        id="hero-canvas"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary/30 to-background"
        aria-hidden
      />
    </section>
  );
}
