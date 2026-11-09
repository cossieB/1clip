import z from "zod"

export const platformCreateSchema = z.object({
    name: z.string(),
    releaseDate: z.string(),
    summary: z.string().optional(),
    logo: z.string()
})

export const platformEditSchema = platformCreateSchema.partial().extend({
    platformId: z.number(),
})