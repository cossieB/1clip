import z from "zod"
import { AdminImageSchema } from "~/utils/zod"

export const developerCreateSchema = z.object({
    name: z.string(),
    summary: z.string().default(""),
    location: z.string().nullish(),
    country: z.string().nullish(),
    file: AdminImageSchema,
})

export const developerEditSchema = developerCreateSchema.partial().extend({
    developerId: z.number(),
})