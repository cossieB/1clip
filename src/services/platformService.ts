import { createServerFunction } from "~/utils/createServerFunction";
import { LimitOffsetSchema } from "~/zod/common";
import * as platformRepository from "~/repositories/platformRepository"
import z from "zod";
import { HttpStatusCode } from "~/utils/statusCodes";
import { platformCreateSchema, platformEditSchema } from "~/zod/platforms";
import { notFound } from "~/utils/notFound";

export const getPlatformsFn = createServerFunction()
    .setValidator(LimitOffsetSchema)
    .handler(async (data) => {
        const platforms = await platformRepository.findAll(data)
        return platforms        
    })

export const getPlatformFn = createServerFunction()
    .setValidator(z.number())    
    .handler(async data => {
        const platform = await platformRepository.findById(data)
        if (!platform) throw notFound( "These aren't the platforms you're looking for")
        return platform        
    })

export const createPlatformFn = createServerFunction()
    .setValidator(platformCreateSchema)
    .handler(async data => {
        const platform =  await platformRepository.createPlatform(data)
        return platform        
    })

export const editPlatformFn = createServerFunction()
    .setValidator(platformEditSchema)
    .handler(async data => {
        const {platformId, ...rest} = data
        await platformRepository.editPlatform(platformId, rest)        
    })