import { notFound } from "@tanstack/solid-router"
import { createServerFn } from "@tanstack/solid-start"
import { adminOnlyMiddleware } from "~/middleware/authorization"
import { staticDataMiddleware } from "~/middleware/static"
import * as platformRepository from "./platformRepository"
import { LimitOffsetSchema } from "~/utils/zod"
import { platformCreateSchema, platformEditSchema } from "./utils/zod"
import { generateSignedUrl } from "~/integrations/uploadService/cloudflareUploadService.server"
import { generateUniqueFilename } from "~/utils/mediaSrc"

export const getPlatformsFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator(LimitOffsetSchema)
    .handler(async ({data}) => {
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

export const createPlatformFn = createServerFn({method: "POST"})    
    .middleware([adminOnlyMiddleware])
    .validator(platformCreateSchema)
    .handler(async ({data}) => {
        const { file, ...rest } = data;
        const platform = await platformRepository.createPlatform({...rest, logo: `logos/${generateUniqueFilename(file.filename)}`})
        const upload = await generateSignedUrl({
            contentLength: file.size,
            contentType: file.contentType,
            key: platform.logo
        })
        return {upload, platform}
    })

export const editPlatformFn = createServerFn({method: "POST"})    
    .middleware([adminOnlyMiddleware])
    .validator(platformEditSchema)
    .handler(async ({data}) => {
        const { platformId, file, ...rest } = data;
        const d = file ? await generateSignedUrl({
            contentLength: file.size,
            contentType: file.contentType,
            key: `logos/${generateUniqueFilename(file.filename)}`
        }) : undefined
        await platformRepository.editPlatform(platformId, {...rest, logo: d?.key});
        return d
    })