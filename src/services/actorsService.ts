"use server"

import { setResponseHeader } from "@solidjs/start/http"
import z from "zod"
import * as actorRepository from "~/repositories/actorRepository"
import { notFound } from "~/utils/notFound"
import { parseZod } from "~/utils/parseZod"
import { ActorCreateSchema, ActorEditSchema } from "~/zod/actors"
import { LimitOffsetSchema } from "~/zod/common"

export async function getActorFn(id: number) {
    parseZod(z.number(), id)
    if (id < 1) throw notFound()
    setResponseHeader("cache-control", "max-age=86400, public, immutable, stale-while-revalidate=604800")
    return actorRepository.findById(id)
}

export async function getActorsFn(filter: z.input<typeof LimitOffsetSchema>) {
    const filters = parseZod(LimitOffsetSchema, (filter))
    setResponseHeader("cache-control", "max-age=86400, public, immutable, stale-while-revalidate=604800")
    return actorRepository.findAll(filters)
}

export async function createActorFn(actor: z.input<typeof ActorCreateSchema>) {
    const data = parseZod(ActorCreateSchema, actor)
    const { characters, ...rest } = data
    return actorRepository.createActor(rest, characters)
}

export async function editActorFn(actor: z.input<typeof ActorEditSchema>) {
    const data = parseZod(ActorEditSchema, actor)
    const { characters, ...rest } = data
    return actorRepository.editActor(rest.actorId, rest, characters)
}

export async function getActorsWithCharactersFn(actorId: number) {
    parseZod(z.number(), actorId)
    if (actorId < 1) throw notFound("These aren't the actors you're looking for")
    const actor = await actorRepository.findActorWithGames(actorId)
    if (!actor) throw notFound("These aren't the actors you're looking for");
    setResponseHeader("cache-control", "max-age=86400, public, immutable, stale-while-revalidate=604800")
    return actor
}