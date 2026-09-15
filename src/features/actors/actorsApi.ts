import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as actorRepository from "./actorRepository"
import { actorCreateSchema, actorEditSchema } from "./utils/zod";
import { LimitOffsetSchema } from "~/utils/zod";
import { generateUniqueFilename } from "~/utils/mediaSrc";
import { generateSignedUrl } from "~/integrations/uploadService/cloudflareUploadService.server";

export const getActorFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator((id: number) => {
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
    .validator(LimitOffsetSchema)
    .handler(async ({ data }) => {
        const actors = await actorRepository.findAll(data)
        return actors
    })

export const createActorFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(actorCreateSchema)
    .handler(async ({ data }) => {
        const { characters, file, ...rest } = data
        const upload = file ? await generateSignedUrl({
            contentLength: file.size,
            contentType: file.contentType,
            key: `people/${generateUniqueFilename(file.filename)}`
        }) : undefined
        const actor = await actorRepository.createActor({
            ...rest,
            photo: upload?.key
        }, characters)
        
        return {actor, upload}
    })

export const editActorFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(actorEditSchema)
    .handler(async ({ data }) => {
        const { actorId, characters, file, ...rest } = data
        const upload = file ? await generateSignedUrl({
            contentLength: file.size,
            contentType: file.contentType,
            key: `people/${generateUniqueFilename(file.filename)}`
        }) : undefined
        await actorRepository.editActor(actorId, { ...rest, photo: upload?.key }, characters)
        return upload
    })

export const getActorsWithCharacters = createServerFn()
    .validator(z.number())
    .handler(async ({ data }) => {
        const actor = await actorRepository.findActorWithGames(data)
        if (!actor) throw notFound()
        return actor
    })    