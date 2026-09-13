import z from "zod"

export const actorCreateSchema = z.object({
    name: z.string(),
    bio: z.string().optional(),
    characters: z.array(z.object({
        appearanceId: z.number().optional(),
        gameId: z.number(),
        character: z.string(),
        roleType: z.enum(['player character', 'major character', 'minor character'])
    }))
})

export const actorEditSchema = actorCreateSchema.partial().extend({
    actorId: z.number(),
    file: z.object({
        size: z.number().lte(8 * 1024 * 1024),
        contentType: z.string().refine(str => /^(image|video|audio)/.test(str)),
        filename: z.string(),
    }).optional()
})