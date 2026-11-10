import z from "zod";

export const GetSquadsSchema = z.object({
    gameId: z.int(),
    userId: z.string(),
    limit: z.int(),
    cursor: z.object({
        createdAt: z.date(),
        lfgId: z.int()
    })
}).partial().optional()

export const SquadCreateSchema = z.object({
    gameId: z.int().nullish(),
    text: z.string().default(""),
    expiresAt: z.date().nullish(),
    slots: z.int().min(1).max(12)
})

export const UpdateSquadSchema = SquadCreateSchema.partial().extend({lfgId: z.int()})

export const GetApplicationsSchema = z.object({
    squadId: z.int(),
    pagination: z.object({
        limit: z.int(),
        cursor: z.int()
    })
})