import z from "zod"

export const GameCreateSchema = z.object({
    title: z.string(),
    developerId: z.int(),
    publisherId: z.int(),
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
    platforms: z.int().array(),
    genres: z.string().array(),
    characters: z.array(z.object({
        appearanceId: z.int().optional(),
        actorId: z.int(),
        character: z.string(),
        roleType: z.enum(['player character', 'major character', 'minor character'])
    })),
})

export const GameEditSchema = GameCreateSchema.partial().extend({ gameId: z.int() })

export const GetGamesSchema = z.object({
    developerId: z.int(),
    publisherId: z.int(),
    actorId: z.int(),
    platformId: z.int(),
    genre: z.string(),
    cursor: z.int(),
    fullTextSearch: z.string(),
    title: z.string()
}).partial()
    .extend({
        limit: z.int().default(50)
    })
    .optional()

export const GameFileSchema = z.object({
    prefix: z.string().optional(),
    files: z.array(z.object({
        filename: z.string(),
        contentType: z.string().startsWith("image/"),
        contentLength: z.int().max(8 * 1024 * 1024),
        metadata: z.record(z.string(), z.string()).optional()
    }))
})    