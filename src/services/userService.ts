'use server'

import z from "zod";
import { createServerFunction } from "~/utils/createServerFunction";
import * as userRepository from "~/repositories/userRepository"
import { notFound } from "~/utils/notFound";
import { getRequestEvent } from "solid-js/web";
import { UpdateUserSchema } from "~/zod/user";
import * as uploadService from "~/integrations/uploadService/cloudflareUploadService"
import { authedOnly } from "~/middleware/authedOnly";
import { AppError } from "~/utils/AppError";
import { HttpStatusCode } from "~/utils/statusCodes";
import { notificationsService } from "~/integrations/notificationService";
import { cacheAside } from "~/utils/cacheAside";
import { getRank } from "~/utils/getRank";
import { forceLogin } from "./authService";

export const getLoggedInUser = createServerFunction()
    .handler(async () => {
        const session = getRequestEvent()?.locals.user
        if (!session) throw notFound()
        const user = await userRepository.findById(session.id);
        if (!user) {
            return forceLogin()
        }
        return user        
    })

export const getUserByUsernameFn = createServerFunction()
    .setValidator(z.coerce.string())
    .handler(async username => {
        const u = getRequestEvent()?.locals.user
        const user = await userRepository.findByUsername(username, u?.id);
        if (!user) throw notFound();
        return user
    })

export const getUserByIdFn = createServerFunction()
    .setValidator(z.uuid())
    .handler(async userId => {
        const u = getRequestEvent()?.locals.user
        const user = await userRepository.findById(userId, u?.id);
        if (!user) throw notFound();
        return user
    })

export const updateCurrentUser = createServerFunction()
    .setValidator(UpdateUserSchema)
    .handler(async data => {
        const user = authedOnly()
        const old = (await userRepository.updateUser(user.id, data))[0]
        if (data.banner != old.oldBanner)
            uploadService.deleteObject(old.oldBanner)
        if (data.image != old.oldAvatar)
            uploadService.deleteObject(old.oldAvatar)
        return new Response(null, { status: 200 })
    })

export const followUserFn = createServerFunction()
    .setValidator(z.uuid())
    .handler(async userId => {
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
    })

export const getUserReputation = createServerFunction()
    .setValidator(z.uuid())
    .handler(async userId => {
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
    })