import { createServerFunction } from "~/utils/createServerFunction";
import { LimitOffsetSchema } from "~/zod/common";
import * as developerRepository from "~/repositories/developerRepository"
import z from "zod";
import { DeveloperCreateSchema, DeveloperEditSchema } from "~/zod/developers";
import { notFound } from "~/utils/notFound";

export const getDevelopersFn = createServerFunction()
    .setValidator(LimitOffsetSchema)
    .handler(async data => {
        const devs = await developerRepository.findAll(data)
        return devs
    })

export const getDeveloperFn = createServerFunction()
    .setValidator(z.number())
    .handler(async developerId => {
        if (developerId < 1) throw notFound( "These aren't the developers you're looking for")
        const dev = await developerRepository.findById(developerId)
        if (!dev) throw notFound( "These aren't the developers you're looking for")
    })    

export const createDeveloperFn = createServerFunction()
    .setValidator(DeveloperCreateSchema)
    .handler(async data => {
        const dev = await developerRepository.createDeveloper(data)
        return dev        
    })

export const editDeveloperFn = createServerFunction()
    .setValidator(DeveloperEditSchema)
    .handler(async data => {
        const {developerId, ...rest} = data
        await developerRepository.editDeveloper(developerId, rest)        
    })    