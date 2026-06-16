"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/experiences", label: "Expériences", icon: Briefcase },
  { href: "/admin/educations", label: "Formations", icon: GraduationCap },
  { href: "/admin/skills", label: "Compétences", icon: Wrench },
  { href: "/admin/projects", label: "Projets", icon: FolderKanban },
  { href: "/admin/profile", label: "Profil", icon: User },
];

function adminPath(locale: string, path: string) {
  return locale === "fr" ? path : `/en${path}`;
}

export function AdminNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push(adminPath(locale, "/admin/login"));
  };

  const NavLink = ({ href, label, icon: Icon }: (typeof navItems)[number]) => {
    const full = adminPath(locale, href);
    const active = pathname.startsWith(full);
    return (
      <Link
        href={full}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Icon className={cn("size-4 shrink-0", active ? "opacity-100" : "opacity-60")} />
        <span className="hidden md:inline">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-60 shrink-0 border-r border-border bg-sidebar flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border/60">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/70">
            Back-office
          </p>
          <p className="text-sm font-semibold mt-0.5 text-foreground">Robin Bonhoure</p>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-4 opacity-60" />
            Déconnexion
          </Button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between bg-sidebar border-b border-border px-3 h-14 shadow-sm">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/70">
          Admin
        </span>
        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const full = adminPath(locale, item.href);
            const active = pathname.startsWith(full);
            return (
              <Link
                key={item.href}
                href={full}
                aria-label={item.label}
                className={cn(
                  "flex items-center justify-center size-9 rounded-lg transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <item.icon className="size-4" />
              </Link>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-9"
          onClick={handleLogout}
          aria-label="Déconnexion"
        >
          <LogOut className="size-4" />
        </Button>
      </nav>
      {/* Mobile spacer */}
      <div className="md:hidden h-14" aria-hidden />
    </>
  );
}
