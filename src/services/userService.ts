'use server'

import z from "zod";
import * as userRepository from "~/repositories/userRepository"
import { notFound } from "~/utils/notFound";
import { getRequestEvent } from "solid-js/web";
import { UpdateUserSchema } from "~/zod/user";
import * as uploadService from "~/integrations/uploadService/cloudflareUploadService"
import { authedOnly } from "~/middleware/authenticate";
import { AppError } from "~/utils/AppError";
import { HttpStatusCode } from "~/utils/statusCodes";
import { notificationsService } from "~/integrations/notificationService";
import { cacheAside } from "~/utils/cacheAside";
import { getRank } from "~/utils/getRank";
import { parseZod } from "~/utils/parseZod";

export async function getLoggedInUser() {
    const session = getRequestEvent()?.locals.user
    if (!session) return null
    const user = await userRepository.findById(session.id);
    
    return user ?? null
}

export async function getUserByUsernameFn(username: string) {
    const u = getRequestEvent()?.locals.user
    const user = await userRepository.findByUsername(z.coerce.string().toLowerCase().parse(username), u?.id);   
    return user ?? null
}

export async function getUserByIdFn(userId: string) {
    parseZod(z.uuid(), userId)
    const u = getRequestEvent()?.locals.user
    const user = await userRepository.findById(userId, u?.id);    
    return user ?? null
}

export async function updateCurrentUser(arg: z.input<typeof UpdateUserSchema>) {
    
    const data = parseZod(UpdateUserSchema, arg);
    const user = authedOnly()
    const old = (await userRepository.updateUser(user.id, data))[0]
    if (data.banner != old.oldBanner)
        uploadService.deleteObject(old.oldBanner)
    if (data.image != old.oldAvatar)
        uploadService.deleteObject(old.oldAvatar)

}

export async function followUserFn(userId: string) {
    parseZod(z.uuid(), userId)
    const user = authedOnly()
    if (userId == user.id) throw new AppError("You can't follow yourself", HttpStatusCode.BAD_REQUEST)
    const res = await userRepository.followUser(user.id, userId)
    const success = res.rowCount === 1
    if (success)
        notificationsService.addNotification(userId, {
            date: new Date().toISOString(),
            message: `You have a new follower! ${user.displayUsername} has followed you.`,
            link: "/users/" + user.username,
            type: "FOLLOW"
        })
    return success
}

export async function getUserReputation(userId: string) {
    parseZod(z.uuid(), userId)
    const res = (await cacheAside(
        `xp:${userId}`,
        () => userRepository.calculateXP(userId),
        86400
    )).at(0)
    if (!res) throw new Response(null, { status: 404 })

    return {
        xp: res.reputation,
        rank: getRank(res.reputation)
    }
}    