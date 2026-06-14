import z from "zod"

export const platformCreateSchema = z.object({
    name: z.string(),
    logo: z.string(),
    releaseDate: z.string(),
    summary: z.string().optional()
})

export const platformEditSchema = platformCreateSchema.partial().extend({platformId: z.number()})