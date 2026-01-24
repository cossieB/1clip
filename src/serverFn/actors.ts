import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as actorRepository from "~/repositories/actorRepository"

export const getActorFn = createServerFn()
    .middleware([staticDataMiddleware])
    .inputValidator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(async ({ data }) => {
        const actor = await actorRepository.findById(data)
        if (!actor) throw notFound()
        return actor
    })

export const getActorsFn = createServerFn()
    .middleware([staticDataMiddleware])
    .handler(async () => {
        const actors = await actorRepository.findAll()
        return actors
    })

const actorCreateSchema = z.object({
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

const actorEditSchema = actorCreateSchema.partial().extend({actorId: z.number()})

export const createActorFn = createServerFn({method: "POST"})  
    .middleware([adminOnlyMiddleware])
    .inputValidator(actorCreateSchema)
    .handler(async ({data}) => {
        const {characters, ...rest} = data
        const actor = await actorRepository.createActor(rest, characters)
        return actor
    })

export const editActorFn = createServerFn({method: "POST"})    
    .middleware([adminOnlyMiddleware])
    .inputValidator(actorEditSchema)
    .handler(async ({data}) => {
        const {actorId, characters, ...rest} = data
        await actorRepository.editActor(actorId, rest, characters)
    })

export const getActorsWithCharacters = createServerFn()
    .inputValidator(z.number())
    .handler(async ({data}) => {
        const actor = await actorRepository.findActorWithGames(data)
        if (!actor) throw notFound()                 
        return actor
    })    