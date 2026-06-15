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

export function AdminNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push(`/${locale}/admin/login`);
  };

  return (
    <nav className="w-56 shrink-0 border-r border-border bg-sidebar flex flex-col">
      <div className="px-6 py-5 border-b border-border">
        <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          Admin
        </span>
      </div>
      <ul className="flex-1 py-4 space-y-0.5 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const full = `/${locale}${href}`;
          const active = pathname.startsWith(full);
          return (
            <li key={href}>
              <Link
                href={full}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Déconnexion
        </Button>
      </div>
    </nav>
  );
}
