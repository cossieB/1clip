import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import * as publisherRepository from "~/repositories/publisherRepository"

export const getPublishersFn = createServerFn().handler(() => publisherRepository.findAll())

export const getPublisherFn = createServerFn()
    .inputValidator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(async ({ data }) => {
        const dev = await publisherRepository.findById(data)
        if (!dev) throw notFound()
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
        return (await publisherRepository.createPublisher(data))[0]
    })

export const editPublisherFn = createServerFn({method: "POST"})   
    .middleware([adminOnlyMiddleware])
    .inputValidator(publisherEditSchema)
    .handler(async ({data}) => {
        const {publisherId, ...rest} = data
        await publisherRepository.editPublisher(publisherId, rest)
    })