"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLocale = () => {
    const next = locale === "fr" ? "en" : "fr";
    const stripped = pathname.replace(/^\/(en|fr)/, "") || "/";
    const target = `/${next}${stripped}`;
    router.push(target);
  };

  const NAV_ITEMS = [
    {
      href: "#experiences",
      label: locale === "fr" ? "Expériences" : "Experience",
    },
    {
      href: "#formations",
      label: locale === "fr" ? "Formations" : "Education",
    },
    { href: "#stack", label: "Stack" },
    { href: "#projets", label: locale === "fr" ? "Projets" : "Projects" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/60 shadow-[0_1px_0_0_var(--border)]"
          : "bg-background/60 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      {/* Logotype */}
      <Link
        href={locale === "fr" ? "/" : "/en"}
        className="text-sm font-semibold tracking-widest uppercase relative group outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Robin Bonhoure
        <span className="absolute -bottom-px left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
      </Link>

      {/* Nav */}
      <nav
        className="hidden md:flex items-center gap-8 text-sm text-muted-foreground"
        aria-label="Navigation principale"
      >
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="relative group text-muted-foreground hover:text-foreground transition-colors duration-200 outline-none focus-visible:text-foreground"
          >
            {label}
            <span className="absolute -bottom-px left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </nav>

      {/* Language toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLocale}
        className="text-xs font-medium tracking-wider uppercase relative group"
        aria-label={
          locale === "fr" ? "Switch to English" : "Passer en français"
        }
      >
        {locale === "fr" ? "EN" : "FR"}
      </Button>
    </header>
  );
}
