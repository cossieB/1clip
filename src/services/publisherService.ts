import { createServerFunction } from "~/utils/createServerFunction";
import { LimitOffsetSchema } from "~/zod/common";
import * as publisherRepository from "~/repositories/publisherRepository"
import z from "zod";
import { notFound } from "~/utils/notFound";
import { publisherCreateSchema, publisherEditSchema } from "~/zod/publishers";

export const getPublishersFn = createServerFunction()
    .setValidator(LimitOffsetSchema)
    .handler(async data => {
        const pubs = await publisherRepository.findAll(data)
        return pubs        
    })

export const getPublisherFn = createServerFunction()
    .setValidator(z.number())
    .handler(async data => {
        const dev = await publisherRepository.findById(data)
        if (!dev) throw notFound()
        return dev        
    })

export const createPublisherFn = createServerFunction()
    .setValidator(publisherCreateSchema)
    .handler(async data => {
        const pub = await publisherRepository.createPublisher(data)
        return pub        
    })

export const editPublisherFn = createServerFunction()
    .setValidator(publisherEditSchema)
    .handler(async data => {
        const {publisherId, ...rest} = data
        await publisherRepository.editPublisher(publisherId, rest)        
    })