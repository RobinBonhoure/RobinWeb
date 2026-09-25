"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceSchema, type ExperienceFormValues } from "@/lib/validators/experience";
import { createExperience, updateExperience } from "@/lib/actions/experiences";
import type { Experience } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulletsField } from "./BulletsField";
import { toast } from "sonner";

interface Props {
  experience?: Experience;
  defaultOrder?: number;
  onSuccess?: () => void;
}

export function ExperienceForm({ experience, defaultOrder = 0, onSuccess }: Props) {
  const isEdit = !!experience;

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: experience
      ? {
          company: experience.company,
          location: experience.location ?? "",
          period: experience.period,
          roleFr: experience.roleFr,
          roleEn: experience.roleEn,
          bulletsFr: experience.bulletsFr,
          bulletsEn: experience.bulletsEn,
          tags: experience.tags,
          order: experience.order,
        }
      : { company: "", location: "", period: "", roleFr: "", roleEn: "", bulletsFr: [], bulletsEn: [], tags: [], order: defaultOrder },
  });

  const onInvalid = () => {
    toast.error("Veuillez remplir tous les champs requis.");
  };

  const onSubmit = async (data: ExperienceFormValues) => {
    try {
      if (isEdit) {
        await updateExperience(experience.id, data);
      } else {
        await createExperience(data);
      }
      toast.success(isEdit ? "Expérience modifiée" : "Expérience ajoutée");
      onSuccess?.();
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="company">Entreprise</Label>
          <Input id="company" {...register("company")} />
          {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Lieu</Label>
          <Input id="location" {...register("location")} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="period">Période</Label>
          <Input id="period" {...register("period")} />
          {errors.period && <p className="text-xs text-destructive">{errors.period.message}</p>}
        </div>
      </div>

      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <BulletsField value={field.value} onChange={field.onChange} label="Tags" />
        )}
      />

      <Tabs defaultValue="fr">
        <TabsList>
          <TabsTrigger value="fr" className="relative">
            Français
            {errors.roleFr && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
          <TabsTrigger value="en" className="relative">
            English
            {errors.roleEn && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fr" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="roleFr">Poste (FR)</Label>
            <Input id="roleFr" {...register("roleFr")} />
            {errors.roleFr && <p className="text-xs text-destructive">{errors.roleFr.message}</p>}
          </div>
          <Controller
            name="bulletsFr"
            control={control}
            render={({ field }) => (
              <BulletsField value={field.value} onChange={field.onChange} label="Points clés (FR)" />
            )}
          />
        </TabsContent>
        <TabsContent value="en" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="roleEn">Role (EN)</Label>
            <Input id="roleEn" {...register("roleEn")} />
            {errors.roleEn && <p className="text-xs text-destructive">{errors.roleEn.message}</p>}
          </div>
          <Controller
            name="bulletsEn"
            control={control}
            render={({ field }) => (
              <BulletsField value={field.value} onChange={field.onChange} label="Key points (EN)" />
            )}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : isEdit ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
