import { z } from "zod";

export const skillSchema = z.object({
  category: z.enum(["stack", "fonctionnel", "qualite"]),
  name: z.string().min(1, "Requis"),
  order: z.number().int(),
});

export type SkillFormValues = z.infer<typeof skillSchema>;
