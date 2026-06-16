import { db } from "@/db";
import { profile } from "@/db/schema";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { notFound } from "next/navigation";

export default async function AdminProfilePage() {
  const [profileData] = await db.select().from(profile).limit(1);
  if (!profileData) notFound();
  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Informations publiques et liens sociaux</p>
      </div>
      <ProfileForm profile={profileData} />
    </>
  );
}
