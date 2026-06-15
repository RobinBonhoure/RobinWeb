import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // FR has no prefix (/), EN gets /en prefix.
  localePrefix: "as-needed",
});
