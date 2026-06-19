import z from "zod"

export const PublisherCreateSchema = z.object({
        name: z.string(),
        logo: z.string(),
        summary: z.string().default(""),
        headquarters: z.string().nullish(),
        country: z.string().nullish()
    })

export const PublisherEditSchema = PublisherCreateSchema.partial().extend({
    publisherId: z.number()
})    
