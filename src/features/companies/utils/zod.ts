import z from "zod"

export const CompanyCreateSchema = z.object({
    name: z.string(),
    summary: z.string().default(""),
    location: z.string().nullish(),
    country: z.string().nullish(),
    logo: z.string(),
})

export const CompanyEditSchema = CompanyCreateSchema.partial().extend({
    developerId: z.int(),
})