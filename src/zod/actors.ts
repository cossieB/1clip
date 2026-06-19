import z from "zod"

export const ActorCreateSchema = z.object({
    name: z.string(),
    bio: z.string().optional(),
    photo: z.string().nullish(),
    characters: z.array(z.object({
        appearanceId: z.number().optional(),
        gameId: z.number(),
        character: z.string(),
        roleType: z.enum(['player character', 'major character', 'minor character'])
    }))
})    

export const ActorEditSchema = ActorCreateSchema.partial().extend({actorId: z.number()})