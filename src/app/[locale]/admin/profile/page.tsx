import { db } from "@/db";
import { profile } from "@/db/schema";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { notFound } from "next/navigation";

export default async function AdminProfilePage() {
  const [profileData] = await db.select().from(profile).limit(1);
  if (!profileData) notFound();
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Profil</h1>
      <ProfileForm profile={profileData} />
    </>
  );
}
