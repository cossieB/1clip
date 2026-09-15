import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as developerRepository from "./developerRepository"
import { LimitOffsetSchema } from "~/utils/zod";
import { developerCreateSchema, developerEditSchema } from "./utils/zod";
import { generateSignedUrl } from "~/integrations/uploadService/cloudflareUploadService.server";
import { generateUniqueFilename } from "~/utils/mediaSrc";

export const getDevelopersFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator(LimitOffsetSchema)
    .handler(async ({ data }) => {
        const devs = await developerRepository.findAll(data);
        return devs
    })

export const getDeveloperFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator((developerId: number) => {
        if (Number.isNaN(developerId) || developerId < 1) throw notFound()
        return developerId
    })
    .handler(async ({ data }) => {
        const dev = await developerRepository.findById(data)
        if (!dev) throw notFound()
        return dev
    })

export const createDeveloperFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(developerCreateSchema)
    .handler(async ({ data }) => {
        const { file, ...rest } = data;
        const developer = await developerRepository.createDeveloper({...rest, logo: `logos/${generateUniqueFilename(file.filename)}`})
        const upload = await generateSignedUrl({
            contentLength: file.size,
            contentType: file.contentType,
            key: developer.logo
        })
        return {upload, developer}
    })

export const editDeveloperFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(developerEditSchema)
    .handler(async ({ data }) => {
        const { developerId, file, ...rest } = data;
        const d = file ? await generateSignedUrl({
            contentLength: file.size,
            contentType: file.contentType,
            key: `logos/${generateUniqueFilename(file.filename)}`
        }) : undefined
        await developerRepository.editDeveloper(developerId, {...rest, logo: d?.key});
        return d
    })