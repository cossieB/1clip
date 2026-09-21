import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as developerRepository from "./developerRepository"
import { LimitOffsetSchema } from "~/utils/zod";
import { developerCreateSchema, developerEditSchema } from "./utils/zod";
import { orphanedFileService } from "~/services/orphanedFileService";
import { storageService } from "~/integrations/storageService/index.server";

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
        const d = await developerRepository.createDeveloper(data)
        orphanedFileService.removePendingUpload(data.logo)
        return d;
    })

export const editDeveloperFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(developerEditSchema)
    .handler(async ({ data }) => {
        const { developerId, ...rest } = data;
        const [old] = await developerRepository.editDeveloper(developerId, rest);      
        if (data.logo) {
            orphanedFileService.removePendingUpload(data.logo);
            (data.logo != old.oldLogo) && storageService.moveToDeletedBucket(old.oldLogo)
        }
    })

