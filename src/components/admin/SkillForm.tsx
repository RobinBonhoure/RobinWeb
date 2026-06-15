"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema, type SkillFormValues } from "@/lib/validators/skill";
import { createSkill, updateSkill } from "@/lib/actions/skills";
import type { Skill } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "stack", label: "Stack technique" },
  { value: "fonctionnel", label: "Fonctionnel" },
  { value: "qualite", label: "Qualités" },
] as const;

interface Props {
  skill?: Skill;
  defaultOrder?: number;
  onSuccess?: () => void;
}

export function SkillForm({ skill, defaultOrder = 0, onSuccess }: Props) {
  const isEdit = !!skill;
  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: skill
      ? { name: skill.name, category: skill.category as "stack" | "fonctionnel" | "qualite", order: skill.order }
      : { name: "", category: "stack", order: defaultOrder },
  });

  const onSubmit = async (data: SkillFormValues) => {
    try {
      if (isEdit) await updateSkill(skill.id, data);
      else await createSkill(data);
      toast.success(isEdit ? "Compétence modifiée" : "Compétence ajoutée");
      onSuccess?.();
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Catégorie</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" {...register("name")} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : isEdit ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
