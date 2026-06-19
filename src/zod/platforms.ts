import z from "zod"

export const PlatformCreateSchema = z.object({
    name: z.string(),
    logo: z.string(),
    releaseDate: z.string(),
    summary: z.string().optional()
})

export const PlatformEditSchema = PlatformCreateSchema.partial().extend({platformId: z.number()})