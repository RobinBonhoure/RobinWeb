"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Profile } from "@/db/schema";

interface Props {
  profile: Profile;
  locale: string;
  stack: string[];
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ profile, locale, stack }: Props) {
  const title = locale === "fr" ? profile.titleFr : profile.titleEn;

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 overflow-hidden"
      aria-label="Introduction"
    >
      {/* Neon RGB ambient glow — dark mode only */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-700"
        style={{
          background: [
            "radial-gradient(ellipse 55% 45% at 12% 58%, rgb(255 0 80 / 0.055) 0%, transparent 70%)",
            "radial-gradient(ellipse 48% 55% at 44% 22%, rgb(0 210 255 / 0.065) 0%, transparent 70%)",
            "radial-gradient(ellipse 38% 48% at 78% 70%, rgb(80 0 255 / 0.05) 0%, transparent 70%)",
          ].join(", "),
        }}
      />

      {/* Grid rules */}
      <div
        className="fixed inset-y-0 left-0 w-px bg-border/60 dark:bg-[linear-gradient(to_bottom,rgb(0_210_255_/_0.22),rgb(80_0_255_/_0.18),rgb(255_0_80_/_0.12))]"
        aria-hidden
      />

      <div className="max-w-2xl space-y-8 relative z-10">
        {/* title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: easeOut }}
        >
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <div className="mt-2.5 h-px w-20 bg-foreground/20 dark:bg-[linear-gradient(to_right,rgb(0_210_255_/_0.7),rgb(80_0_255_/_0.4),transparent)]" />
        </motion.div>

        {/* Stack pills */}
        {stack.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65, ease: easeOut }}
            aria-label="Tech stack"
          >
            {stack.map((name) => (
              <span
                key={name}
                className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground/70 dark:text-black/100 border border-border/50 dark:border-white/[0.08] px-2.5 py-1 rounded-sm bg-background/80 dark:bg-white/80"
              >
                {name}
              </span>
            ))}
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center gap-4 pt-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: easeOut }}
        >
          <Link
            href="#projets"
            className="neon-btn-glow inline-flex h-11 items-center gap-2 bg-foreground text-background px-7 text-sm font-medium tracking-wide rounded-md hover:bg-foreground/80 transition-[colors,box-shadow] focus-visible:outline"
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
    </section>
  );
}
