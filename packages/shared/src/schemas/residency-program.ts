import { z } from "zod";

export const ResidencyProgramTypeSchema = z.enum([
  "residency",
  "work", 
  "investor",
  "digital_nomad"
]);

export const ResidencyProgramSchema = z.object({
  id: z.number(),
  country: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }),
  type: ResidencyProgramTypeSchema,
  name: z.string(),
  requirements: z.string(),
  fees: z.number(),
  processingTimeDays: z.number(),
});

export const CreateResidencyProgramSchema = ResidencyProgramSchema.omit({
  id: true,
  country: true,
}).extend({
  countryId: z.number(),
});

export const UpdateResidencyProgramSchema = CreateResidencyProgramSchema.partial();

export type ResidencyProgramType = z.infer<typeof ResidencyProgramTypeSchema>;
export type ResidencyProgram = z.infer<typeof ResidencyProgramSchema>;
export type CreateResidencyProgram = z.infer<typeof CreateResidencyProgramSchema>;
export type UpdateResidencyProgram = z.infer<typeof UpdateResidencyProgramSchema>;
