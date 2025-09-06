import { z } from "zod";

export const ProviderSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }),
  city: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  services: z.string(),
  rating: z.number().min(0).max(5),
});

export const CreateProviderSchema = ProviderSchema.omit({
  id: true,
  country: true,
}).extend({
  countryId: z.number(),
});

export const UpdateProviderSchema = CreateProviderSchema.partial();

export type Provider = z.infer<typeof ProviderSchema>;
export type CreateProvider = z.infer<typeof CreateProviderSchema>;
export type UpdateProvider = z.infer<typeof UpdateProviderSchema>;
