import z from "zod"

export const CompanyCreateSchema = z.object({
    name: z.string(),
    summary: z.string().default(""),
    headquarters: z.string().nullish(),
    country: z.string().nullish(),
    logo: z.string(),
})

export const CompanyEditSchema = CompanyCreateSchema.partial().extend({
    companyId: z.int(),
})