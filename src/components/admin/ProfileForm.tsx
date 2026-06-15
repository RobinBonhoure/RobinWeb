"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/lib/validators/profile";
import { updateProfile } from "@/lib/actions/profile";
import type { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "./ImageUpload";
import { FileUpload } from "./FileUpload";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  profile: Profile;
}

export function ProfileForm({ profile }: Props) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      titleFr: profile.titleFr,
      titleEn: profile.titleEn,
      aboutFr: profile.aboutFr,
      aboutEn: profile.aboutEn,
      email: profile.email,
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      socials: profile.socials ?? [],
      cvPdfUrl: profile.cvPdfUrl ?? "",
      photoUrl: profile.photoUrl ?? "",
    },
  });

  const { fields: socialFields, append, remove } = useFieldArray({ control, name: "socials" });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(profile.id, data);
      toast.success("Profil mis à jour");
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Photo</h2>
        <ImageUpload
          value={watch("photoUrl") ?? ""}
          onChange={(url) => setValue("photoUrl", url)}
          folder="profile"
        />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" {...register("name")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="location">Localisation</Label>
          <Input id="location" {...register("location")} />
        </div>
      </div>

      <Tabs defaultValue="fr">
        <TabsList>
          <TabsTrigger value="fr">Français</TabsTrigger>
          <TabsTrigger value="en">English</TabsTrigger>
        </TabsList>
        <TabsContent value="fr" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleFr">Titre (FR)</Label>
            <Input id="titleFr" {...register("titleFr")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aboutFr">À propos (FR)</Label>
            <Textarea id="aboutFr" {...register("aboutFr")} rows={6} />
          </div>
        </TabsContent>
        <TabsContent value="en" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleEn">Title (EN)</Label>
            <Input id="titleEn" {...register("titleEn")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aboutEn">About (EN)</Label>
            <Textarea id="aboutEn" {...register("aboutEn")} rows={6} />
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Réseaux / Liens</h2>
        {socialFields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <Input {...register(`socials.${i}.label`)} placeholder="Label" className="w-32 shrink-0" />
            <Input {...register(`socials.${i}.url`)} placeholder="https://…" />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ label: "", url: "" })} className="gap-2">
          <Plus className="size-3.5" />
          Ajouter un lien
        </Button>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label>CV (PDF)</Label>
        <FileUpload
          value={watch("cvPdfUrl") ?? ""}
          onChange={(url) => setValue("cvPdfUrl", url)}
          folder="cv"
          accept=".pdf,application/pdf"
          label="Uploader le CV PDF"
        />
        <p className="text-xs text-muted-foreground">
          Ou collez une URL directement :
        </p>
        <Input {...register("cvPdfUrl")} placeholder="https://…" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
