'use server'

import z from "zod"
import * as actorRepository from "~/repositories/actorRepository"
import { createServerFunction } from "~/utils/createServerFunction"
import { notFound } from "~/utils/notFound"
import { HttpStatusCode } from "~/utils/statusCodes"
import { actorCreateSchema, actorEditSchema } from "~/zod/actors"
import { LimitOffsetSchema } from "~/zod/common"

export const getActorFn = createServerFunction()
    .setValidator(z.coerce.number())
    .handler(async id => {
        if (id < 1) throw notFound()
        return actorRepository.findById(id)
    })

export const getActorsFn = createServerFunction()
    .setValidator(LimitOffsetSchema)
    .handler(async (filters) => actorRepository.findAll(filters))

export const createActorFn = createServerFunction()
    .setValidator(actorCreateSchema)
    .handler(data => {
        const { characters, ...rest } = data
        return actorRepository.createActor(rest, characters)
    })

export const editActorFn = createServerFunction()
    .setValidator(actorEditSchema)
    .handler(data => {
        const { characters, ...rest } = data
        return actorRepository.editActor(rest.actorId, rest, characters)
    })

export const getActorsWithCharactersFn = createServerFunction()
    .setValidator(z.coerce.number())
    .handler(async actorId => {
        if (actorId < 1) throw notFound( "These aren't the actors you're looking for")
        const actor = await actorRepository.findActorWithGames(actorId)
        if (!actor) throw notFound( "These aren't the actors you're looking for");
        return actor
    })
