import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { authedMiddleware } from "~/middleware/authorization";
import * as notificationsRepository from "./notificationsRepository"

export const getNotifications = createServerFn()
    .middleware([authedMiddleware])
    .handler(async({context}) => {
        return await notificationsRepository.getNotifications({userId: context.user.id})
    })

export const markNotificationAsRead = createServerFn()
    .middleware([authedMiddleware])
    .validator(z.number().array())
    .handler(async ({context, data}) => {
        await notificationsRepository.markAsRead(data, context.user.id)
    })