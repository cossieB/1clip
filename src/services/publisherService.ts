'use server'

import { LimitOffsetSchema } from "~/zod/common";
import * as publisherRepository from "~/repositories/publisherRepository"
import z from "zod";
import { notFound } from "~/utils/notFound";
import { PublisherCreateSchema, PublisherEditSchema } from "~/zod/publishers";
import { parseZod } from "~/utils/parseZod";
import { setResponseHeader } from "@solidjs/start/http";

export async function getPublishersFn(args: z.input<typeof LimitOffsetSchema>) {
    const data = parseZod(LimitOffsetSchema, args)
    const devs = await publisherRepository.findAll(data)
    setResponseHeader("cache-control", "max-age=86400, public, immutable, stale-while-revalidate=604800")    
    return devs
}
export async function getPublisherFn(publisherId: number) {
    parseZod(z.number(), publisherId)
    if (publisherId < 1) throw notFound("These aren't the publishers you're looking for")
    const dev = await publisherRepository.findById(publisherId)
    if (!dev) throw notFound("These aren't the publishers you're looking for")
    setResponseHeader("cache-control", "max-age=86400, public, immutable, stale-while-revalidate=604800")        
    return dev
}

export async function createPublisherFn(arg: z.input<typeof PublisherCreateSchema>) {
    const data = parseZod(PublisherCreateSchema, arg)
    const dev = await publisherRepository.createPublisher(data)
    return dev
}

export async function editPublisherFn(arg: z.input<typeof PublisherEditSchema>) {
    const data = parseZod(PublisherEditSchema, arg)
    const { publisherId, ...rest } = data
    await publisherRepository.editPublisher(publisherId, rest)
}