'use server'

import { LimitOffsetSchema } from "~/zod/common";
import * as developerRepository from "~/repositories/developerRepository"
import z from "zod";
import { DeveloperCreateSchema, DeveloperEditSchema } from "~/zod/developers";
import { notFound } from "~/utils/notFound";
import { parseZod } from "~/utils/parseZod";

export async function getDevelopersFn(args: z.input<typeof LimitOffsetSchema>) {
    const data = parseZod(LimitOffsetSchema, args)
    const devs = await developerRepository.findAll(data)
    return devs
}
export async function getDeveloperFn(developerId: number) {
    parseZod(z.number(), developerId)
    if (developerId < 1) throw notFound("These aren't the developers you're looking for")
    const dev = await developerRepository.findById(developerId)
    if (!dev) throw notFound("These aren't the developers you're looking for")
    return dev
}

export async function createDeveloperFn(arg: z.input<typeof DeveloperCreateSchema>) {
    const data = parseZod(DeveloperCreateSchema, arg)
    const dev = await developerRepository.createDeveloper(data)
    return dev
}

export async function editDeveloperFn(arg: z.input<typeof DeveloperEditSchema>) {
    const data = parseZod(DeveloperEditSchema, arg)
    const { developerId, ...rest } = data
    await developerRepository.editDeveloper(developerId, rest)
}