import { createMiddleware } from "@tanstack/solid-start"
import { getCurrentUser } from "~/serverFn/auth"

export const authedMiddleware = createMiddleware()
    .server(async ({ next }) => {
        const user = await getCurrentUser()
        if (!user) throw new Response(null, { status: 401 })
        return next({ context: { user } })
    })

export const verifiedOnlyMiddleware = createMiddleware()
    .middleware([authedMiddleware])
    .server(async ({ next, context }) => {
        if (!context.user.emailVerified) throw new Response(null, { status: 403 })
        return next()
    })

export const adminOnlyMiddleware = createMiddleware()
    .middleware([authedMiddleware])
    .server(async ({ next, context }) => {
        const { user } = context
        if (user.role !== "admin") throw new Response(null, { status: 403 })
        return next()
    })

