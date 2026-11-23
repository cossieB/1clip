import z from "zod";
import * as actorRepository from "./actorRepository"
import { actorCreateSchema, actorEditSchema } from "./utils/zod";
import { LimitOffsetSchema } from "~/utils/zod";
import { orphanedFileService } from "~/services/orphanedFileService";
import { storageService } from "~/integrations/storageService/index.server";
import { db } from "~/drizzle/db";
import { GET } from "@solidjs/web/server-functions";
import { zodSafeParse } from "~/utils/zodSafeParse";
import { redirect, respond } from "@solidjs/web";
import { ensureAdmin } from "../auth/authApi";
import { paths } from "~/router";

export const getActorFn = GET(async (id: number) => {
    'use server'
    const data = zodSafeParse(z.int(), id)
    const actor = await actorRepository.findById(data)
    return respond(actor ?? null, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})

export const getActorsFn = GET(async (args: z.input<typeof LimitOffsetSchema>) => {
    'use server'
    const data = zodSafeParse(LimitOffsetSchema, args)
    const actors = await actorRepository.findAll(data)
    return respond(actors, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})

export async function createActorFn(input: z.input<typeof actorCreateSchema>) {
    'use server'
    const data = zodSafeParse(actorCreateSchema, input)
    await ensureAdmin()
    const { characters, ...actor } = data
    const a = await actorRepository.createActor(actor, characters)
    if (data.photo) orphanedFileService.removePendingUpload(data.photo)
    return redirect(paths.admin.actors(a.actorId)())
}

export async function editActorFn(input: z.input<typeof actorEditSchema>) {
    'use server'
    const data = zodSafeParse(actorEditSchema, input)
    await ensureAdmin()
    const { actorId, characters, ...actor } = data
    const [old] = await actorRepository.editActor(actorId, actor, characters);
    if (data.photo) {
        orphanedFileService.removePendingUpload(data.photo);
        (old.oldPhoto && data.photo !== old.oldPhoto) && storageService.moveToDeletedBucket(old.oldPhoto)
    }
}

export const getActorsWithCharactersFn = GET(async (id: number) => {
    'use server'
    const data = zodSafeParse(z.int(), id)
    const actor = await actorRepository.findActorWithGames(data)
    return respond(actor ?? null, {
        headers: {
            "Cache-Control": actor ? "public, max-age=604800, stale-while-revalidate=86400" : "public, max-age=300",
            ...(actor && {
                "Last-Modified": (actor.dateModified ?? actor.dateAdded).toUTCString()
            })
        }
    });
})

export const searchActorsFn = GET(async (name: string) => {
    'use server'
    const data = zodSafeParse(z.string().nonempty(), name)
    const actors = await db.query.actors.findMany({
        where: {
            name: {
                ilike: `%${data}%`
            }
        },
        orderBy: {
            name: "asc"
        }
    })
    return respond(actors, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})

export const getActorsAdminFn = GET(async (args: z.input<typeof LimitOffsetSchema>) => {
    'use server'
    const actors = await getActorsFn(args)
    return respond(actors, {
        headers: {
            "Cache-Control": "no-store"
        }
    })
})