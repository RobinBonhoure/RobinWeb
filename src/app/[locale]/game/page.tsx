import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import GameCanvas from "@/components/game/TreadmillGame/GameCanvas";

// const GameCanvas = dynamic(
//   () => import("@/components/game/TreadmillGame/GameCanvas"),
//   { ssr: false },
// );

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  return (
    <div
      style={{ height: "100dvh", overflow: "hidden", background: "#050505" }}
    >
      <GameCanvas locale={locale} />
    </div>
  );
}
