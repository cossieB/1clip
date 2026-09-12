import z from "zod"

export const publisherCreateSchema = z.object({
        name: z.string(),
        logo: z.string(),
        summary: z.string().default(""),
        headquarters: z.string().nullish(),
        country: z.string().nullish()
    })

export const publisherEditSchema = publisherCreateSchema.partial().extend({
    publisherId: z.number()
})    
