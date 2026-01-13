import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import * as actorRepository from "~/repositories/actorRepository"

export const getActorFn = createServerFn()
    .inputValidator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(({ data }) => {
        return actorRepository.findById(data)
    })

export const getActorsFn = createServerFn()
    .handler(() => actorRepository.findAll())

const actorCreateSchema = z.object({
    name: z.string(),
    bio: z.string().optional(),
    photo: z.string().nullish()
})    

const actorEditSchema = actorCreateSchema.partial().extend({actorId: z.number()})

export const createActorFn = createServerFn({method: "POST"})  
    .middleware([adminOnlyMiddleware])
    .inputValidator(actorCreateSchema)
    .handler(async ({data}) => {
        return (await actorRepository.createActor(data))[0]
    })

export const editActorFn = createServerFn({method: "POST"})    
    .middleware([adminOnlyMiddleware])
    .inputValidator(actorEditSchema)
    .handler(async ({data}) => {
        const {actorId, ...rest} = data
        await actorRepository.editActor(actorId, rest)
    })