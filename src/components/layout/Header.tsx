"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const next = locale === "fr" ? "en" : "fr";
    // Strip current locale prefix if present, then add new one.
    const stripped = pathname.replace(/^\/(en|fr)/, "") || "/";
    const target = next === routing.defaultLocale ? stripped : `/${next}${stripped}`;
    router.push(target);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-background/80 backdrop-blur-md border-b border-border/40">
      <Link
        href={locale === "fr" ? "/" : "/en"}
        className="text-sm font-semibold tracking-widest uppercase"
      >
        Robin Bonhoure
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <Link href="#experiences" className="hover:text-foreground transition-colors">
          {locale === "fr" ? "Expériences" : "Experience"}
        </Link>
        <Link href="#formations" className="hover:text-foreground transition-colors">
          {locale === "fr" ? "Formations" : "Education"}
        </Link>
        <Link href="#stack" className="hover:text-foreground transition-colors">Stack</Link>
        <Link href="#projets" className="hover:text-foreground transition-colors">
          {locale === "fr" ? "Projets" : "Projects"}
        </Link>
      </nav>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLocale}
        className="text-xs font-medium tracking-wider uppercase"
        aria-label="Changer de langue"
      >
        {locale === "fr" ? "EN" : "FR"}
      </Button>
    </header>
  );
}
