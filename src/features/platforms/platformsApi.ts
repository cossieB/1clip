import * as platformRepository from "./platformRepository"
import { platformCreateSchema, platformEditSchema } from "./utils/zod"
import { orphanedFileService } from "~/services/orphanedFileService"
import { storageService } from "~/integrations/storageService/index.server"
import { GET } from "@solidjs/web/server-functions"
import { LimitOffsetSchema } from "~/utils/zod"
import { zodSafeParse } from "~/utils/zodSafeParse"
import z from "zod"
import { respond } from "@solidjs/web"
import { ensureAdmin } from "../auth/utils/ensureAuth"

export const getPlatformsFn = GET(async (arg: z.input<typeof LimitOffsetSchema>) => {
    'use server'
    const data = zodSafeParse(LimitOffsetSchema, arg)
    const platforms = await platformRepository.findAll(data);
    return respond(platforms, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})

export const getPlatformFn = GET(async (id: number) => {
    'use server'
    const data = zodSafeParse(z.int(), id)
    const platform = await platformRepository.findById(data)
    return respond(platform ?? null, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})

export async function createPlatformFn(platform: z.input<typeof platformCreateSchema>) {
    'use server'
    const data = zodSafeParse(platformCreateSchema, platform)
    await ensureAdmin()
    const p = await platformRepository.createPlatform(data)
    orphanedFileService.removePendingUpload(data.logo)
    return p
}

export async function editPlatformFn(platform: z.input<typeof platformEditSchema>) {
    'use server'
    const data = zodSafeParse(platformEditSchema, platform)
    await ensureAdmin()
    const { platformId, ...rest } = data;
    const [old] = await platformRepository.editPlatform(platformId, rest);
    if (data.logo) {
        orphanedFileService.removePendingUpload(data.logo);
        (data.logo != old.oldLogo) && storageService.moveToDeletedBucket(old.oldLogo)
    }
}

