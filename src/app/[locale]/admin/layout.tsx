import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav locale={locale} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
