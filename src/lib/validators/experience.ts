import { z } from "zod";

export const experienceSchema = z.object({
  company: z.string().min(1, "Requis"),
  location: z.string().optional(),
  period: z.string().min(1, "Requis"),
  roleFr: z.string().min(1, "Requis"),
  roleEn: z.string().min(1, "Requis"),
  bulletsFr: z.array(z.string()),
  bulletsEn: z.array(z.string()),
  order: z.number().int(),
});

export type ExperienceFormValues = z.infer<typeof experienceSchema>;
