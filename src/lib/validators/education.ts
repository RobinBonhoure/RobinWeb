import { z } from "zod";

export const educationSchema = z.object({
  school: z.string().min(1, "Requis"),
  period: z.string().min(1, "Requis"),
  titleFr: z.string().min(1, "Requis"),
  titleEn: z.string().min(1, "Requis"),
  detailFr: z.string().optional(),
  detailEn: z.string().optional(),
  order: z.number().int(),
});

export type EducationFormValues = z.infer<typeof educationSchema>;
