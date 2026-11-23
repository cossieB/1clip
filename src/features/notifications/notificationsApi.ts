import z from "zod";
import * as notificationsRepository from "./notificationsRepository"
import { GET } from "@solidjs/web/server-functions";
import { ensureVerified } from "../auth/authApi";
import { createOptimisticStore } from "solid-js";
import { getCurrentUser } from "../auth/serverFn";
import { session } from "../auth/authApi";

export const getNotifications = GET(async () => {
    'use server'
    const userSession = await getCurrentUser()
    if (!userSession) return []
    const notification = await notificationsRepository.getNotifications({ userId: userSession.user.id })
    return notification
})

export async function markNotificationAsRead(notificationIds: number[]) {
    'use server'
    const data = z.int().array().parse(notificationIds)
    const userSession = await ensureVerified();
    await notificationsRepository.markAsRead(data, userSession.user.id)
}

export const [notificationsMemo, setNotificationsMemo] = createOptimisticStore(() => {
    if (!session().data) return []
    return getNotifications()
}, [], {
    ssrSource: "client"
})