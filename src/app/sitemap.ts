import { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";

const BASE_URL = "https://robinweb.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allProjects = await db.select({ slug: projects.slug }).from(projects);

  const locales = ["fr", "en"] as const;

  const homeRoutes = locales.map((locale) => ({
    url: locale === "fr" ? BASE_URL : `${BASE_URL}/en`,
    lastModified: new Date(),
    alternates: {
      languages: {
        fr: BASE_URL,
        en: `${BASE_URL}/en`,
      },
    },
  }));

  const projectRoutes = allProjects.flatMap(({ slug }) =>
    locales.map((locale) => ({
      url:
        locale === "fr"
          ? `${BASE_URL}/projets/${slug}`
          : `${BASE_URL}/en/projets/${slug}`,
      lastModified: new Date(),
    }))
  );

  return [...homeRoutes, ...projectRoutes];
}
