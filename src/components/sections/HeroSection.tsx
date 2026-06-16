"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Profile } from "@/db/schema";
import { HeroScene } from "@/components/three/HeroSceneLazy";

interface Props {
  profile: Profile;
  locale: string;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ profile, locale }: Props) {
  const title = locale === "fr" ? profile.titleFr : profile.titleEn;
  const [firstName, ...rest] = profile.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 overflow-hidden"
      aria-label="Introduction"
    >
      {/* Grid rules */}
      <div className="absolute inset-y-0 left-0 w-px bg-border/60" aria-hidden />

      <div className="max-w-4xl space-y-10 relative z-10">
        {/* Eyebrow */}
        <motion.p
          className="text-label text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: easeOut }}
        >
          Portfolio — {new Date().getFullYear()}
        </motion.p>

        {/* Display name */}
        <div aria-hidden className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: easeOut }}
            className="leading-[0.88] text-foreground"
          >
            <span className="text-display block">{firstName}</span>
            <span className="text-display-light block">{lastName}</span>
          </motion.h1>
          <h1 className="sr-only">{profile.name}</h1>
        </div>

        {/* Title */}
        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-xl font-light leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65, ease: easeOut }}
        >
          {title}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center gap-4 pt-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85, ease: easeOut }}
        >
          <Link
            href="#projets"
            className="inline-flex h-11 items-center gap-2 bg-foreground text-background px-7 text-sm font-medium tracking-wide rounded-md hover:bg-foreground/80 transition-colors focus-visible:outline"
          >
            {locale === "fr" ? "Voir mes projets" : "View my projects"}
          </Link>
          {profile.cvPdfUrl && (
            <a
              href={profile.cvPdfUrl}
              download
              className="inline-flex h-11 items-center gap-2 border border-border px-7 text-sm font-medium tracking-wide rounded-md hover:bg-secondary transition-colors"
            >
              {locale === "fr" ? "Télécharger mon CV" : "Download my CV"}
            </a>
          )}
        </motion.div>
      </div>

      {/* Bottom meta */}
      <motion.div
        className="absolute bottom-8 left-6 md:left-16 lg:left-24 flex items-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        {profile.location && (
          <span className="text-label text-muted-foreground/60">{profile.location}</span>
        )}
        <a
          href={`mailto:${profile.email}`}
          className="text-label text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          {profile.email}
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-6 md:right-16 lg:right-24 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        aria-hidden
      >
        <span className="text-label text-muted-foreground/40 -rotate-90 origin-center translate-y-8">
          scroll
        </span>
        <div className="w-px h-12 bg-border mt-10" />
      </motion.div>

      <HeroScene />
    </section>
  );
}
