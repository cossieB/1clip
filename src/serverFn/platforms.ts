import { notFound } from "@tanstack/solid-router"
import { createServerFn } from "@tanstack/solid-start"
import z from "zod"
import { cacheService } from "~/integrations/cacheService"
import { adminOnlyMiddleware } from "~/middleware/authorization"
import { staticDataMiddleware } from "~/middleware/static"
import * as platformRepository from "~/repositories/platformRepository"

export const getPlatformsFn = createServerFn()
    .middleware([staticDataMiddleware])
    .handler(async () => {
        const key = "platforms"
        const cached = await cacheService.get<ReturnType<typeof platformRepository.findAll>>(key)
        if (cached) return cached
        const platforms = await platformRepository.findAll()
        void cacheService.set(key, platforms)
        return platforms
    })

export const getPlatformFn = createServerFn()
    .middleware([staticDataMiddleware])
    .inputValidator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(async ({ data }) => {
        const key = `platform:${data}`
        const cached = cacheService.get<ReturnType<typeof platformRepository.findById>>(key)
        if (cached) return cached;
        const platform = await platformRepository.findById(data)
        if (!platform) throw notFound()
        void cacheService.set(key, platform)
        return platform
    })

const platformCreateSchema = z.object({
    name: z.string(),
    logo: z.string(),
    releaseDate: z.string(),
    summary: z.string().optional()
})

const platformEditSchema = platformCreateSchema.partial().extend({platformId: z.number()})

export const createPlatformFn = createServerFn({method: "POST"})    
    .middleware([adminOnlyMiddleware])
    .inputValidator(platformCreateSchema)
    .handler(async ({data}) => {
        const platform =  await platformRepository.createPlatform(data)
        cacheService.delete("platforms")
        return platform
    })

export const editPlatformFn = createServerFn({method: "POST"})    
    .middleware([adminOnlyMiddleware])
    .inputValidator(platformEditSchema)
    .handler(async ({data}) => {
        const {platformId, ...rest} = data
        await platformRepository.editPlatform(platformId, rest)
        void cacheService.delete("platforms", `platform:${platformId}`)
    })