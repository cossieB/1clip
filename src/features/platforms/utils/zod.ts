import z from "zod"
import { AdminImageSchema } from "~/utils/zod"

export const platformCreateSchema = z.object({
    name: z.string(),
    releaseDate: z.string(),
    summary: z.string().optional(),
    file: AdminImageSchema,
})

export const platformEditSchema = platformCreateSchema.partial().extend({
    platformId: z.number(),
})