import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import * as userRepository from "~/repositories/userRepository"
import { forceLogin, getCurrentUser as getCurrentUser } from "./auth";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import { AppError } from "~/utils/AppError";
import * as uploadService from "~/integrations/uploadService/cloudflareUploadService"
import { HttpStatusCode } from "~/utils/statusCodes";
import { notificationsService } from "~/integrations/notificationService";
import { cacheAside } from "~/utils/cacheAside";
import { getRank } from "~/utils/getRank";

export const getLoggedInUser = createServerFn()
    .handler(async () => {
        const session = await getCurrentUser()
        if (!session) throw notFound()
        const user = await userRepository.findById(session.id);
        if (!user) {
            return forceLogin()
        }
        return user
    })

export const getUserByUsernameFn = createServerFn()
    .inputValidator((username: string) => username)
    .handler(async ({ data }) => {
        const u = await getCurrentUser()
        
        const user = await userRepository.findByUsername(data, u?.id);
        if (!user) throw notFound();
        return user
    })

export const getUserByIdFn = createServerFn()
    .inputValidator((id: unknown) => {
        const validated = z.uuid().safeParse(id)
        if (validated.error)
            throw notFound()
        else
            return validated.data
    })
    .handler(async ({ data }) => {
        const u = await getCurrentUser()
        const user = await userRepository.findById(data, u?.id);
        if (!user) throw notFound();
        return user
    })

export const updateCurrentUser = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .inputValidator()
    .handler(async ({ data, context: { user } }) => {

        if (Object.keys(data).length === 0) throw new AppError("Nothing to update", HttpStatusCode.BAD_REQUEST)

            const old = (await userRepository.updateUser(user.id, data))[0]
            if (data.banner != old.oldBanner)
                uploadService.deleteObject(old.oldBanner)
            if (data.image != old.oldAvatar)
                uploadService.deleteObject(old.oldAvatar)
            return new Response(null, { status: 200 })
    })

export const followUserFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.uuidv7())
    .handler(async ({ data, context: { user } }) => {
        if (data == user.id) throw new AppError("You can't follow yourself", HttpStatusCode.BAD_REQUEST)
        const res = await userRepository.followUser(user.id, data)
        const success = res.rowCount === 1
        if (success) 
            notificationsService.addNotification(data, {
                date: new Date().toISOString(),
                message: `You have a new follower! ${user.displayUsername} has followed you.`,
                link: "/users/" + user.username,
                type: "FOLLOW"
            })
        return success
    })

export const getUserReputation = createServerFn()
    .inputValidator(z.uuidv7())
    .handler(async ({data}) => {
        const res = (await cacheAside(
            `xp:${data}`, 
            () => userRepository.calculateXP(data),
            86400
        )).at(0)
        if (!res) throw new Response(null, {status: 404})
        return {
            xp: res.reputation,
            rank: getRank(res.reputation)
        } 
    })    
