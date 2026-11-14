import z from "zod"

export const actorCreateSchema = z.object({
    name: z.string(),
    bio: z.string().optional(),
    characters: z.array(z.object({
        appearanceId: z.int().optional(),
        gameId: z.int(),
        character: z.string(),
        roleType: z.enum(['player character', 'major character', 'minor character'])
    })),
    photo: z.string().nullish()
})

export const actorEditSchema = actorCreateSchema.partial().extend({
    actorId: z.int(),
})