import z from "zod"

export const developerCreateSchema = z.object({
    name: z.string(),
    summary: z.string().default(""),
    location: z.string().nullish(),
    country: z.string().nullish(),
    logo: z.string(),
})

export const developerEditSchema = developerCreateSchema.partial().extend({
    developerId: z.number(),
})