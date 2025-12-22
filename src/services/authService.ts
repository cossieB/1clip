import { redirect } from "@tanstack/solid-router"
import { createIsomorphicFn, createServerFn } from "@tanstack/solid-start"
import { getRequestHeaders } from "@tanstack/solid-start/server"
import { auth } from "~/auth/server"
import { authClient } from "~/auth/authClient"
import * as userRepository from "~/repositories/userRepository"

export const checkSessionFn = createIsomorphicFn().server(async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({
        headers
    })
    if (session) throw redirect({
        to: "/settings/profile", search: {
            toasts: [{ text: "Already logged in", type: "info", autoFade: true }]
        }
    })
}).client(async () => {
    const session = authClient.useSession()
    if (session()?.data?.session) throw redirect({
        to: "/settings/profile", search: {
            toasts: [{ text: "Already logged in", type: "info", autoFade: true }]
        }
    })
})

export const getSessionFn = createIsomorphicFn().server(async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({
        headers
    })
    if (!session) throw redirect({ to: "/auth/signin" })
    return session.user

}).client(async () => {
    const session = authClient.useSession()
    const data = session().data
    if (!data) throw redirect({ to: "/auth/signin" })
    return data.user
})

export const getProfileFn = createServerFn().handler(async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
        headers
    })
    if (!session) throw redirect({ to: "/auth/signin" })
    const user = (await userRepository.findById(session.user.id)).at(0);
    if (!user) {
        await auth.api.revokeSession({
            headers,
            body: {
                token: session.session.token
            }
        })
        throw redirect({
            to: "/auth/signin", search: {
                toasts: [{
                    text: "Please login again",
                    type: "warning",
                    autoFade: false
                }]
            }
        })
    }
    return user
})

export const getCurrentUserId = createServerFn()
    .handler(async () => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({
            headers
        })
        if (!session) return null
        return session.user.id
    })

export const revokeSession = createServerFn()
    .handler(async () => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({
            headers
        })
        if (session)
            await auth.api.revokeSession({
                headers,
                body: {
                    token: session.session.token
                }
            })
    })