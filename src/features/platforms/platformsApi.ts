import { notFound } from "@tanstack/solid-router"
import { createServerFn } from "@tanstack/solid-start"
import { adminOnlyMiddleware } from "~/middleware/authorization"
import { staticDataMiddleware } from "~/middleware/static"
import * as platformRepository from "./platformRepository"
import { LimitOffsetSchema } from "~/utils/zod"
import { platformCreateSchema, platformEditSchema } from "./utils/zod"
import { orphanedFileService } from "~/services/orphanedFileService"
import { storageService } from "~/integrations/storageService/index.server"

export const getPlatformsFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator(LimitOffsetSchema)
    .handler(async ({ data }) => {
        const platforms = await platformRepository.findAll(data);
        return platforms
    })

export const getPlatformFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(async ({ data }) => {
        const platform = await platformRepository.findById(data)
        if (!platform) throw notFound()
        return platform
    })

export const createPlatformFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(platformCreateSchema)
    .handler(async ({ data }) => {
        const p = await platformRepository.createPlatform(data)
        orphanedFileService.removePendingUpload(data.logo)
        return p
    })

export const editPlatformFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(platformEditSchema)
    .handler(async ({ data }) => {
        const { platformId, ...rest } = data;
        const [old] = await platformRepository.editPlatform(platformId, rest);
        if (data.logo) {
            orphanedFileService.removePendingUpload(data.logo);
            (data.logo != old.oldLogo) && storageService.moveToDeletedBucket(old.oldLogo)
        }
    })