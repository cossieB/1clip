import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as publisherRepository from "~/repositories/publisherRepository"
import { LimitOffsetSchema } from "~/zod/common";
import { publisherCreateSchema, publisherEditSchema } from "~/zod/publishers";

export const getPublishersFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator(LimitOffsetSchema)
    .handler(async ({data}) => {        
        const pubs = await publisherRepository.findAll(data)
        return pubs
    })

export const getPublisherFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(async ({ data }) => {        
        const dev = await publisherRepository.findById(data)
        if (!dev) throw notFound()
        return dev
    })


export const createPublisherFn = createServerFn({method: "POST"}) 
    .middleware([adminOnlyMiddleware])
    .validator(publisherCreateSchema)
    .handler(async ({data}) => {
        const pub = await publisherRepository.createPublisher(data)
        return pub
    })

export const editPublisherFn = createServerFn({method: "POST"})   
    .middleware([adminOnlyMiddleware])
    .validator(publisherEditSchema)
    .handler(async ({data}) => {
        const {publisherId, ...rest} = data
        await publisherRepository.editPublisher(publisherId, rest)
    })