import z from "zod";
import * as notificationsRepository from "./notificationsRepository"
import { GET } from "@solidjs/web/server-functions";
import { getCurrentUser } from "~/features/auth/serverFn";
import { respond } from "@solidjs/web";
import { HttpStatusCode } from "~/utils/statusCodes";

export const getNotifications = GET(async () => {
    const userSession = await getCurrentUser();
    if (!userSession) throw respond("Unauthorized", {
        status: HttpStatusCode.UNAUTHORIZED
    })
    return notificationsRepository.getNotifications({ userId: userSession.user.id })
})

export async function markNotificationAsRead(notificationIds: number[]) {
    const data = z.number().array().parse(notificationIds)
    const userSession = await getCurrentUser();
    if (!userSession) throw respond("Unauthorized", {
        status: HttpStatusCode.UNAUTHORIZED
    })
    await notificationsRepository.markAsRead(data, userSession.user.id)
}
