import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as developerRepository from "~/repositories/developerRepository"

export const getDevelopersFn = createServerFn()
    .middleware([staticDataMiddleware])
    .handler(async () => {        
        const devs = await developerRepository.findAll()
        return devs
    })

export const getDeveloperFn = createServerFn()
    .middleware([staticDataMiddleware])
    .inputValidator((developerId: number) => {
        if (Number.isNaN(developerId) || developerId < 1) throw notFound()
        return developerId
    })
    .handler(async ({ data }) => {        
        const dev = await developerRepository.findById(data)
        if (!dev) throw notFound()
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
        return dev
    })

export const editDeveloperFn = createServerFn({method: "POST"})   
    .middleware([adminOnlyMiddleware])
    .inputValidator(developerEditSchema)
    .handler(async ({data}) => {
        const {developerId, ...rest} = data
        await developerRepository.editDeveloper(developerId, rest)
    })