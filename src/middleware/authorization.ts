import { createMiddleware } from "@tanstack/solid-start"
import { getCurrentUser } from "~/serverFn/auth"
import { AppError } from "~/utils/AppError"
import { HttpStatusCode } from "~/utils/statusCodes"

export const authedMiddleware = createMiddleware()
    .server(async ({ next }) => {
        const user = await getCurrentUser()
        if (!user) throw new AppError("Please login.", HttpStatusCode.UNAUTHORIZED)
        return next({ context: { user } })
    })

export const verifiedOnlyMiddleware = createMiddleware()
    .middleware([authedMiddleware])
    .server(async ({ next, context }) => {
        if (!context.user.emailVerified) throw new AppError("Please verify your email first.", HttpStatusCode.FORBIDDEN)
        return next()
    })

export const adminOnlyMiddleware = createMiddleware()
    .middleware([authedMiddleware])
    .server(async ({ next, context }) => {
        const { user } = context
        if (user.role !== "admin") throw new AppError("Forbidden", HttpStatusCode.FORBIDDEN)
        return next()
    })

    