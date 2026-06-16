import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(locale === "fr" ? "/admin/login" : `/en/admin/login`);
  }

  return (
    <div data-admin className="flex min-h-screen flex-col md:flex-row bg-sidebar">
      <AdminNav locale={locale} />
      <main className="flex-1 p-6 md:p-8 overflow-auto bg-background">{children}</main>
    </div>
  );
}
