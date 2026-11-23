import { query } from "@solidjs/router";
import { redirect, respond } from "@solidjs/web";
import z from "zod";
import * as userRepository from "./userRepository"
import { getCurrentUser } from "../auth/serverFn";
import { paths } from "~/router";
import { GetUserSchema, UpdateUserSchema } from "./utils/zod";
import { GET } from "@solidjs/web/server-functions/server";
import { storageService } from "~/integrations/storageService/index.server";
import { orphanedFileService } from "~/services/orphanedFileService";
import { zodSafeParse } from "~/utils/zodSafeParse";
import { ensureVerified } from "../auth/utils/ensureAuth";
import { OnlineUsersService } from "~/services/onlineUsersService";
import { broadcast } from "@solidjs/web/server-functions";
import { sleep } from "~/lib/sleep";
import { rateLimiter } from "~/utils/rateLimiter.server";
import { addNotification } from "../notifications/addNotification";
import { db } from "~/drizzle/db";

export const getUserFn = query(async (input: z.input<typeof GetUserSchema>) => {
    'use server'
    const data = zodSafeParse(GetUserSchema, input)
    const userSession = await getCurrentUser()
    const user = await userRepository.findUser(data, userSession?.user.id)
    return respond(user, {
        headers: {
            // "Cache-Control": "private, max-age=60"
        }
    })
}, "user")

export async function updateUserFn(profile: z.input<typeof UpdateUserSchema>) {
    'use server'
    const data = zodSafeParse(UpdateUserSchema, profile)
    const userSession = await ensureVerified()
    try {
        const old = (await userRepository.updateUser(userSession.user.id, data))[0]
        if (data.banner != old.oldBanner) {
            storageService.deleteObject(old.oldBanner);
            orphanedFileService.removePendingUpload(data.banner!)
        }

        if (data.image != old.oldAvatar) {
            storageService.deleteObject(old.oldAvatar)
            orphanedFileService.removePendingUpload(data.image!)
        }
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const getProfileFn = query(async () => {
    'use server'
    const session = await getCurrentUser()
    if (!session) throw redirect(paths({ dialog: "signin" }))
    return getUserFn({ id: session.user.id })
}, "profile")

const G = z.object({
    gameId: z.int(),
    title: z.string()
})

export async function setStatusFn(game: z.input<typeof G>) {
    'use server'
    const data = zodSafeParse(G, game)
    const userSession = await ensureVerified()
    await OnlineUsersService.setStatus(userSession.user.id, {
        ...data,
        username: userSession.user.displayUsername!,
        image: userSession.user.image!
    })
}

export const getStatusFn = async (userId?: string) => {
    'use server'
    userId ??= (await getCurrentUser())?.user.id
    if (!userId) return {
        gameId: -1,
        title: "In Lobby"
    }
    const status = await OnlineUsersService.getUserStatus(userId)
    return status
}

const POLL_MS = 5_000;

export const watchOnlineUsersFn = broadcast(async function* () {
    'use server'
    let last = "";
    while (true) {
        const users = await OnlineUsersService.getOnlineUsers();
        const next = JSON.stringify(users);
        if (next !== last) {
            last = next;
            yield users;
        }
        await sleep(POLL_MS)
    }
})

export async function toggleFollowFn(targetUserId: string) {
    'use server'
    const userSession = await ensureVerified()
    if (targetUserId === userSession.user.id) {
        throw respond(new Error("You can't follow yourself."), {status: 400});
    }
    await rateLimiter("user:follow", userSession.user.id, 10, 60)
    const res = await userRepository.toggleFollow(targetUserId, userSession.user.id)

    if (res?.following) {
        void addNotification(db, [{ userId: targetUserId }], {
            actionUrl: "/users/" + userSession.user.username,
            type: "FOLLOW",
            title: `You have a new follower!`,
            message: `${userSession.user.displayUsername} has followed you.`,
            sourceUserId: userSession.user.id,
        })
    }
    return res
}