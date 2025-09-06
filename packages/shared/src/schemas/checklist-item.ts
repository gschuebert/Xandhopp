import { z } from "zod";

export const ChecklistItemSchema = z.object({
  id: z.number(),
  country: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  orderIndex: z.number(),
});

export const CreateChecklistItemSchema = ChecklistItemSchema.omit({
  id: true,
  country: true,
}).extend({
  countryId: z.number(),
});

export const UpdateChecklistItemSchema = CreateChecklistItemSchema.partial();

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type CreateChecklistItem = z.infer<typeof CreateChecklistItemSchema>;
export type UpdateChecklistItem = z.infer<typeof UpdateChecklistItemSchema>;
