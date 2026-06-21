import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as developerRepository from "~/repositories/developerRepository"
import { LimitOffsetSchema } from "~/zod/common";
import { developerCreateSchema, developerEditSchema } from "~/zod/developers";

export const getDevelopersFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator(LimitOffsetSchema)
    .handler(async ({data}) => {        
        const devs = await developerRepository.findAll(data)
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

export const createDeveloperFn = createServerFn({method: "POST"}) 
    .middleware([adminOnlyMiddleware])
    .validator(developerCreateSchema)
    .handler(async ({data}) => {
        const dev = await developerRepository.createDeveloper(data)
        return dev
    })

export const editDeveloperFn = createServerFn({method: "POST"})   
    .middleware([adminOnlyMiddleware])
    .validator(developerEditSchema)
    .handler(async ({data}) => {
        const {developerId, ...rest} = data
        await developerRepository.editDeveloper(developerId, rest)
    })