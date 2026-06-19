'use server'

import { LimitOffsetSchema } from "~/zod/common";
import * as platformRepository from "~/repositories/platformRepository"
import z from "zod";
import { PlatformCreateSchema, PlatformEditSchema } from "~/zod/platforms";
import { notFound } from "~/utils/notFound";
import { parseZod } from "~/utils/parseZod";

export async function getPlatformsFn(args: z.input<typeof LimitOffsetSchema>) {
    const data = parseZod(LimitOffsetSchema, args)
    const devs = await platformRepository.findAll(data)
    return devs
}
export async function getPlatformFn(platformId: number) {
    parseZod(z.number(), platformId)
    if (platformId < 1) throw notFound("These aren't the platforms you're looking for")
    const dev = await platformRepository.findById(platformId)
    if (!dev) throw notFound("These aren't the platforms you're looking for")
    return dev
}

export async function createPlatformFn(arg: z.input<typeof PlatformCreateSchema>) {
    const data = parseZod(PlatformCreateSchema, arg)
    const dev = await platformRepository.createPlatform(data)
    return dev
}

export async function editPlatformFn(arg: z.input<typeof PlatformEditSchema>) {
    const data = parseZod(PlatformEditSchema, arg)
    const { platformId, ...rest } = data
    await platformRepository.editPlatform(platformId, rest)
}