import z from "zod"

export const DeveloperCreateSchema = z.object({
        name: z.string(),
        logo: z.string(),
        summary: z.string().default(""),
        location: z.string().nullish(),
        country: z.string().nullish()
    })

export const DeveloperEditSchema = DeveloperCreateSchema.partial().extend({
    developerId: z.number()
})