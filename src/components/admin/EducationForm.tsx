"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema, type EducationFormValues } from "@/lib/validators/education";
import { createEducation, updateEducation } from "@/lib/actions/educations";
import type { Education } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BulletsField } from "./BulletsField";
import { toast } from "sonner";

interface Props {
  education?: Education;
  defaultOrder?: number;
  onSuccess?: () => void;
}

export function EducationForm({ education, defaultOrder = 0, onSuccess }: Props) {
  const isEdit = !!education;
  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: education
      ? {
          school: education.school,
          period: education.period,
          titleFr: education.titleFr,
          titleEn: education.titleEn,
          detailFr: education.detailFr ?? "",
          detailEn: education.detailEn ?? "",
          tags: education.tags,
          order: education.order,
        }
      : { school: "", period: "", titleFr: "", titleEn: "", detailFr: "", detailEn: "", tags: [], order: defaultOrder },
  });

  const onInvalid = () => {
    toast.error("Veuillez remplir tous les champs requis.");
  };

  const onSubmit = async (data: EducationFormValues) => {
    try {
      if (isEdit) await updateEducation(education.id, data);
      else await createEducation(data);
      toast.success(isEdit ? "Formation modifiée" : "Formation ajoutée");
      onSuccess?.();
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="school">École / Organisme</Label>
          <Input id="school" {...register("school")} />
          {errors.school && <p className="text-xs text-destructive">{errors.school.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="period">Période</Label>
          <Input id="period" {...register("period")} />
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
            {errors.titleFr && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
          <TabsTrigger value="en" className="relative">
            English
            {errors.titleEn && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fr" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleFr">Titre (FR)</Label>
            <Input id="titleFr" {...register("titleFr")} />
            {errors.titleFr && <p className="text-xs text-destructive">{errors.titleFr.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detailFr">Détail (FR)</Label>
            <Textarea id="detailFr" {...register("detailFr")} rows={2} />
          </div>
        </TabsContent>
        <TabsContent value="en" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleEn">Title (EN)</Label>
            <Input id="titleEn" {...register("titleEn")} />
            {errors.titleEn && <p className="text-xs text-destructive">{errors.titleEn.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detailEn">Detail (EN)</Label>
            <Textarea id="detailEn" {...register("detailEn")} rows={2} />
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : isEdit ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
