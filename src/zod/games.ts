import z from "zod"

export const GameCreateSchema = z.object({
    title: z.string(),
    developerId: z.number(),
    publisherId: z.number(),
    banner: z.string(),
    cover: z.string(),
    summary: z.string().optional(),
    releaseDate: z.iso.date(),
    trailer: z.string().nullish(),
    media: z.array(z.object({
        key: z.string(),
        contentType: z.string(),
        metadata: z.record(z.string(), z.string()).optional()
    })),
    platforms: z.number().array(),
    genres: z.string().array()
})

export const GameEditSchema = GameCreateSchema.partial().extend({ gameId: z.number() })

export const GetGamesSchema = z.object({
    developerId: z.number(),
    publisherId: z.number(),
    actorId: z.number(),
    platformId: z.number(),
    genre: z.string(),
    cursor: z.number()
})
    .partial()
    .extend({
        limit: z.number().default(50)
    })