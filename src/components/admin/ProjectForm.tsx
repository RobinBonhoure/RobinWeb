"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  projectSchema,
  type ProjectFormValues,
} from "@/lib/validators/project";
import { createProject, updateProject } from "@/lib/actions/projects";
import type { Project } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulletsField } from "./BulletsField";
import { ImageUpload } from "./ImageUpload";
import { toast } from "sonner";

interface Props {
  project?: Project;
  defaultOrder?: number;
  onSuccess?: () => void;
}

export function ProjectForm({ project, defaultOrder = 0, onSuccess }: Props) {
  const isEdit = !!project;
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          slug: project.slug,
          titleFr: project.titleFr,
          titleEn: project.titleEn,
          descFr: project.descFr,
          descEn: project.descEn,
          tags: project.tags,
          imageUrl: project.imageUrl ?? "",
          liveUrl: project.liveUrl ?? "",
          repoUrl: project.repoUrl ?? "",
          featured: project.featured,
          order: project.order,
        }
      : {
          slug: "",
          titleFr: "",
          titleEn: "",
          descFr: "",
          descEn: "",
          tags: [],
          imageUrl: "",
          liveUrl: "",
          repoUrl: "",
          featured: false,
          order: defaultOrder,
        },
  });

  const imageUrl = useWatch({ control, name: "imageUrl" }) ?? "";

  const hasEnErrors = !!(errors.titleEn || errors.descEn);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (isEdit) await updateProject(project.id, data);
      else await createProject(data);
      toast.success(isEdit ? "Projet modifié" : "Projet ajouté");
      onSuccess?.();
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  const onInvalid = () => {
    toast.error("Veuillez remplir tous les champs requis.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" {...register("slug")} placeholder="mon-projet" />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="liveUrl">URL live</Label>
          <Input
            id="liveUrl"
            {...register("liveUrl")}
            placeholder="https://…"
          />
          {errors.liveUrl && (
            <p className="text-xs text-destructive">{errors.liveUrl.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="repoUrl">URL repo</Label>
          <Input
            id="repoUrl"
            {...register("repoUrl")}
            placeholder="https://github.com/…"
          />
          {errors.repoUrl && (
            <p className="text-xs text-destructive">{errors.repoUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Image</Label>
        <ImageUpload
          value={imageUrl}
          onChange={(url) => setValue("imageUrl", url)}
          folder="projects"
        />
      </div>

      <div className="flex items-center gap-3">
        <Controller
          name="featured"
          control={control}
          render={({ field }) => (
            <Switch
              id="featured"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="featured">Mis en avant</Label>
      </div>

      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <BulletsField
            value={field.value}
            onChange={field.onChange}
            label="Tags"
          />
        )}
      />

      <Tabs defaultValue="fr">
        <TabsList>
          <TabsTrigger value="fr" className="relative">
            Français
            {(errors.titleFr || errors.descFr) && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
          <TabsTrigger value="en" className="relative">
            English
            {hasEnErrors && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fr" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleFr">Titre (FR)</Label>
            <Input id="titleFr" {...register("titleFr")} />
            {errors.titleFr && (
              <p className="text-xs text-destructive">{errors.titleFr.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descFr">Description (FR)</Label>
            <Textarea id="descFr" {...register("descFr")} rows={3} />
            {errors.descFr && (
              <p className="text-xs text-destructive">{errors.descFr.message}</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="en" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleEn">Title (EN)</Label>
            <Input id="titleEn" {...register("titleEn")} />
            {errors.titleEn && (
              <p className="text-xs text-destructive">{errors.titleEn.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descEn">Description (EN)</Label>
            <Textarea id="descEn" {...register("descEn")} rows={3} />
            {errors.descEn && (
              <p className="text-xs text-destructive">{errors.descEn.message}</p>
            )}
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
