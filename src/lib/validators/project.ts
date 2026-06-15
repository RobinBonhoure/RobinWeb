import { z } from "zod";

export const projectSchema = z.object({
  slug: z.string().min(1, "Requis").regex(/^[a-z0-9-]+$/, "Slug invalide (a-z, 0-9, -)"),
  titleFr: z.string().min(1, "Requis"),
  titleEn: z.string().min(1, "Requis"),
  descFr: z.string().min(1, "Requis"),
  descEn: z.string().min(1, "Requis"),
  tags: z.array(z.string()),
  imageUrl: z.string().optional(),
  liveUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  repoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  featured: z.boolean(),
  order: z.number().int(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
