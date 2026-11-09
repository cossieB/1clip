import z from "zod";
import * as notificationsRepository from "./notificationsRepository"
import { GET } from "@solidjs/web/server-functions";
import { getCurrentUser } from "~/features/auth/serverFn";
import { respond } from "@solidjs/web";
import { HttpStatusCode } from "~/utils/statusCodes";

export const getNotifications = GET(async () => {
    'use server'
    const userSession = await getCurrentUser();
    if (!userSession) throw respond("Unauthorized", {
        status: HttpStatusCode.UNAUTHORIZED
    })
    const notification = await notificationsRepository.getNotifications({ userId: userSession.user.id })
    return respond(notification, {
        headers: {
            "Cache-Control": "private, max-age=60"
        }
    })
})

export async function markNotificationAsRead(notificationIds: number[]) {
    'use server'
    const data = z.number().array().parse(notificationIds)
    const userSession = await getCurrentUser();
    if (!userSession) throw respond("Unauthorized", {
        status: HttpStatusCode.UNAUTHORIZED
    })
    await notificationsRepository.markAsRead(data, userSession.user.id)
}
