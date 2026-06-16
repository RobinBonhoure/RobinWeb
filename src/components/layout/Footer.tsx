import { db } from "@/db";
import { profile, type SocialLink } from "@/db/schema";

interface Props {
  locale: string;
}

export async function Footer({ locale }: Props) {
  const [p] = await db.select().from(profile).limit(1);
  if (!p) return null;

  const year = new Date().getFullYear();
  const socialLinks = ((p.socials as SocialLink[]) ?? []).filter(
    (s) => Boolean(s.url),
  );

  return (
    <footer className="border-t border-border px-6 md:px-16 lg:px-24 py-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-widest uppercase">
            {p.name}
          </p>
          <a
            href={`mailto:${p.email}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {p.email}
          </a>
        </div>

        {socialLinks.length > 0 && (
          <nav
            className="flex items-center gap-6"
            aria-label={locale === "fr" ? "Réseaux sociaux" : "Social links"}
          >
            {socialLinks.map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-label text-muted-foreground hover:text-foreground transition-colors"
              >
                {label.toUpperCase()}
              </a>
            ))}
          </nav>
        )}

        <p className="text-label text-muted-foreground/50">© {year}</p>
      </div>
    </footer>
  );
}
