import { z } from "zod";

export const CountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  iso2: z.string().length(2),
  continent: z.string(),
  summary: z.string().optional(),
  costOfLivingIndex: z.number(),
  taxRate: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateCountrySchema = CountrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCountrySchema = CreateCountrySchema.partial();

export type Country = z.infer<typeof CountrySchema>;
export type CreateCountry = z.infer<typeof CreateCountrySchema>;
export type UpdateCountry = z.infer<typeof UpdateCountrySchema>;