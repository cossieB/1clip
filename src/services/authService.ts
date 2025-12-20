import { redirect } from "@tanstack/solid-router"
import { createIsomorphicFn } from "@tanstack/solid-start"
import { getRequestHeaders } from "@tanstack/solid-start/server"
import { auth } from "~/utils/auth"
import { authClient } from "~/utils/authClient"

export const checkSessionFn = createIsomorphicFn().server(async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({
        headers
    })
    if (session) throw redirect({ to: "/settings/profile" })
}).client(async () => {
    const session = authClient.useSession()
    if (session()?.data?.session) throw redirect({to: "/settings/profile"})
})

export const getSessionFn = createIsomorphicFn().server(async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({
        headers
    })   
    if (!session) throw redirect({to: "/auth/signin"})
    return session.user

}).client(async () => {
    const session = authClient.useSession()
    const data = session().data
    if (!data) throw redirect({to: "/auth/signin"})
    return data.user
})
