import { z } from "zod";

const socialSchema = z.object({
  label: z.string().min(1),
  url: z.string().url("URL invalide"),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Requis"),
  titleFr: z.string().min(1, "Requis"),
  titleEn: z.string().min(1, "Requis"),
  aboutFr: z.string().min(1, "Requis"),
  aboutEn: z.string().min(1, "Requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  location: z.string().optional(),
  socials: z.array(socialSchema),
  cvPdfUrl: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
