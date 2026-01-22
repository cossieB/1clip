import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { cacheService } from "~/integrations/cacheService";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as developerRepository from "~/repositories/developerRepository"

export const getDevelopersFn = createServerFn()
    .middleware([staticDataMiddleware])
    .handler(async () => {
        const key = "developers"
        const cached = await cacheService.get<ReturnType<typeof developerRepository.findAll>>(key)
        if (cached) return cached
        const devs = await developerRepository.findAll()
        void cacheService.set(key, devs)
        return devs
    })

export const getDeveloperFn = createServerFn()
    .middleware([staticDataMiddleware])
    .inputValidator((developerId: number) => {
        if (Number.isNaN(developerId) || developerId < 1) throw notFound()
        return developerId
    })
    .handler(async ({ data }) => {
        const key = `developer:${data}`
        const cached = await cacheService.get<ReturnType<typeof developerRepository.findById>>(key)
        if (cached) return cached
        const dev = await developerRepository.findById(data)
        if (!dev) throw notFound()
        void cacheService.set(key, dev)
        return dev
    })

const developerCreateSchema = z.object({
        name: z.string(),
        logo: z.string(),
        summary: z.string().default(""),
        location: z.string().nullish(),
        country: z.string().nullish()
    })

const developerEditSchema = developerCreateSchema.partial().extend({
    developerId: z.number()
})

export const createDeveloperFn = createServerFn({method: "POST"}) 
    .middleware([adminOnlyMiddleware])
    .inputValidator(developerCreateSchema)
    .handler(async ({data}) => {
        const dev = await developerRepository.createDeveloper(data)
        void cacheService.delete("developers")
        return dev
    })

export const editDeveloperFn = createServerFn({method: "POST"})   
    .middleware([adminOnlyMiddleware])
    .inputValidator(developerEditSchema)
    .handler(async ({data}) => {
        const {developerId, ...rest} = data
        await developerRepository.editDeveloper(developerId, rest)
        void cacheService.delete("developers", `developer:${developerId}`)
    })