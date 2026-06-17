import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  axes: ["opsz"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const BASE_URL = "https://robinweb.fr";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";

  return {
    title: {
      template: "%s | Robin Bonhoure",
      default: "Robin Bonhoure",
    },
    description: isFr
      ? "Développeur front-end React / Next.js — Toulouse, France"
      : "Front-end Developer React / Next.js — Toulouse, France",
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: isFr ? BASE_URL : `${BASE_URL}/en`,
      languages: {
        fr: BASE_URL,
        en: `${BASE_URL}/en`,
      },
    },
    openGraph: {
      siteName: "Robin Bonhoure",
      locale: isFr ? "fr_FR" : "en_US",
      type: "website",
      url: isFr ? BASE_URL : `${BASE_URL}/en`,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Prevent flash of unstyled theme on load */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var s=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark')}})();` }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
