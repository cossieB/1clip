import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { cacheService } from "~/integrations/cacheService";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as publisherRepository from "~/repositories/publisherRepository"

export const getPublishersFn = createServerFn()
    .middleware([staticDataMiddleware])
    .handler(async () => {
        const key = "publishers"
        const cached = await cacheService.get<ReturnType<typeof publisherRepository.findAll>>(key);
        if (cached) return cached
        const pubs = await publisherRepository.findAll()
        void cacheService.set(key, pubs)
        return pubs
    })

export const getPublisherFn = createServerFn()
    .middleware([staticDataMiddleware])
    .inputValidator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(async ({ data }) => {
        const key = `publisher:${data}`
        const cached = cacheService.get<ReturnType<typeof publisherRepository.findById>>(key)
        if (cached) return cached
        const dev = await publisherRepository.findById(data)
        if (!dev) throw notFound()
        void cacheService.set(key, dev)
        return dev
    })

const publisherCreateSchema = z.object({
        name: z.string(),
        logo: z.string(),
        summary: z.string().default(""),
        headquarters: z.string().nullish(),
        country: z.string().nullish()
    })

const publisherEditSchema = publisherCreateSchema.partial().extend({
    publisherId: z.number()
})    

export const createPublisherFn = createServerFn({method: "POST"}) 
    .middleware([adminOnlyMiddleware])
    .inputValidator(publisherCreateSchema)
    .handler(async ({data}) => {
        const pub = await publisherRepository.createPublisher(data)
        void cacheService.delete("publishers")
        return pub
    })

export const editPublisherFn = createServerFn({method: "POST"})   
    .middleware([adminOnlyMiddleware])
    .inputValidator(publisherEditSchema)
    .handler(async ({data}) => {
        const {publisherId, ...rest} = data
        await publisherRepository.editPublisher(publisherId, rest)
    })