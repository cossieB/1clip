import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import * as userRepository from "~/features/users/userRepository"
import { forceLogin, getCurrentUser as getCurrentUser } from "../../serverFn/auth";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import { AppError } from "~/utils/AppError.server";
import * as uploadService from "~/integrations/uploadService/cloudflareUploadService.server"
import { HttpStatusCode } from "~/utils/statusCodes";
import { notificationsService } from "~/integrations/notificationService";
import { cacheAside } from "~/utils/cacheAside.server";
import { getRank } from "~/utils/getRank";
import { addNotification } from "~/features/notifications/notificationsRepository";
import { AdminImageSchema } from "~/utils/zod";
import { UserImageSchema } from "./utils/zod";

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
    .validator((username: string) => username)
    .handler(async ({ data }) => {
        const u = await getCurrentUser()

        const user = await userRepository.findByUsername(data, u?.id);
        if (!user) throw notFound();
        return user
    })

export const getUserByIdFn = createServerFn()
    .validator((id: unknown) => {
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
    .validator(z.object({
        displayName: z.string().min(3).max(15).optional(),
        bio: z.string().max(255).optional(),
        imageFile: UserImageSchema,
        bannerFile: UserImageSchema,
        dob: z.iso.date().nullish(),
        location: z.string().max(100).nullish(),
        links: z.string().array().transform(arr => arr.slice(0, 5)).optional()
    }))
    .handler(async ({ data, context: { user } }) => {

        const {imageFile, bannerFile, ...rest} = data;

        const [av, ba] = await Promise.all([
            uploadService.createFileDetails(imageFile, ["users", user.id]),
            uploadService.createFileDetails(bannerFile, ["users", user.id])
        ])
        const u = {
            ...rest,
            image: av?.key,
            banner: ba?.key
        }
        if (Object.keys(u).length === 0) throw new AppError("Nothing to update", HttpStatusCode.BAD_REQUEST);

        const old = (await userRepository.updateUser(user.id, u))[0]
        if (u.banner != old.oldBanner)
            uploadService.deleteObject(old.oldBanner)
        if (u.image != old.oldAvatar)
            uploadService.deleteObject(old.oldAvatar)
        
        return {
            avatar: av,
            banner: ba
        }
    })

export const followUserFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .validator(z.uuidv7())
    .handler(async ({ data, context: { user } }) => {
        if (data == user.id) throw new AppError("You can't follow yourself", HttpStatusCode.BAD_REQUEST)
        const res = await userRepository.followUser(user.id, data)
        const success = res.rowCount === 1
        if (success) {
            await addNotification({
                recipientId: data,
                actionUrl: "/users/" + user.username,
                type: "FOLLOW",
                title: `You have a new follower!`,
                message: `${user.displayUsername} has followed you.`,
                sourceUserId: user.id,
            })
            notificationsService.publish(data)
        }
        return success
    })

export const getUserReputation = createServerFn()
    .validator(z.uuidv7())
    .handler(async ({ data }) => {
        const res = (await cacheAside(
            `xp:${data}`,
            () => userRepository.calculateXP(data),
            86400
        )).at(0)
        if (!res) throw new Response(null, { status: 404 })
        return {
            xp: res.reputation,
            rank: getRank(res.reputation)
        }
    })    
