import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LenisProvider } from "@/components/layout/LenisProvider";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LenisProvider>
      <Header />
      <div className="pt-16 flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <Footer locale={locale} />
      </div>
    </LenisProvider>
  );
}
