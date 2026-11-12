import { query } from "@solidjs/router";
import { getRequestEvent, redirect, respond } from "@solidjs/web";
import z from "zod";
import * as userRepository from "./userRepository"
import { getCurrentUser } from "../auth/serverFn";
import { paths } from "~/router";
import { UpdateUserSchema } from "./utils/zod";
import { GET } from "@solidjs/web/server-functions/server";
import { storageService } from "~/integrations/storageService/index.server";
import { orphanedFileService } from "~/services/orphanedFileService";
import { zodSafeParse } from "~/utils/zodSafeParse";
import { ensureAuthed, ensureVerified } from "../auth/utils/ensureAuth";
import { redis } from "~/utils/redis";
import { OnlineUsersService } from "~/services/onlineUsersService";

export const getUser = query(async (id: string) => {
    'use server'
    const parse = z.uuidv7().safeParse(id)
    if (!parse.success) throw respond(new Error("User not found"), { status: 404 });
    return userRepository.findById(parse.data)
}, "user")

export async function updateUser(profile: z.input<typeof UpdateUserSchema>) {
    'use server'
    const data = zodSafeParse(UpdateUserSchema, profile)
    const userSession = await ensureVerified()
    const old = (await userRepository.updateUser(userSession.user.id, data))[0]
    if (data.banner != old.oldBanner) {
        storageService.deleteObject(old.oldBanner);
        orphanedFileService.removePendingUpload(data.banner!)
    }

    if (data.image != old.oldAvatar) {
        storageService.deleteObject(old.oldAvatar)
        orphanedFileService.removePendingUpload(data.image!)
    }
}

export const getProfile = GET(async () => {
    'use server'
    const session = await getCurrentUser()
    if (!session) throw redirect(paths({ dialog: "signin" }))
    return getUser(session.user.id)
})

const G = z.object({
    gameId: z.int(),
    title: z.string()
})

export async function setStatusFn(game: z.input<typeof G>) {
    'use server'
    const data = zodSafeParse(G, game)
    const userSession = await ensureVerified()
    const key = `userstatus:${userSession.user.id}`;
    await redis.multi()
        .hSet(key, {
            ...data,
            username: userSession.user.displayUsername!,
            image: userSession.user.image!
        })
        .expire(key, 28800)
        .exec()
}

export const getStatusFn = async (userId?: string) => {
    'use server'
    userId ??= (await getCurrentUser())?.user.id
    if (!userId) throw respond(null, { status: 404 });
    const status = await OnlineUsersService.getUserStatus(userId)
    return status
}

export const getOnlineUsers = GET(async () => {
    'use server'    
    const statuses = await OnlineUsersService.getOnlineUsers()
    return respond(statuses, {
        headers: {
            "Cache-Control": "public, max-age=900"
        }
    })
})