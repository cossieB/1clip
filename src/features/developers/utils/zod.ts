import z from "zod"

export const developerCreateSchema = z.object({
        name: z.string(),
        logo: z.string(),
        summary: z.string().default(""),
        location: z.string().nullish(),
        country: z.string().nullish()
    })

export const developerEditSchema = developerCreateSchema.partial().extend({
    developerId: z.number()
})