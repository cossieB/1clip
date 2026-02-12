import { createMiddleware } from "@tanstack/solid-start";
import { getRequestIP } from "@tanstack/solid-start/server";
import { AppError } from "~/utils/AppError";
import { redis } from "~/utils/redis";
import { HttpStatusCode } from "~/utils/statusCodes";

const options = {
    TRIM: {
        threshold: 1000,
        strategyModifier: "~",
        strategy: "MAXLEN"
    }
} as const

export const globalMiddleware = createMiddleware().server(async ({ request, next, serverFnMeta, pathname, context }) => {
    const start = Date.now()
    const ipAddress = getRequestIP()
    const data = {
        ipAddress: ipAddress ?? "127.0.0.1",
        ...(serverFnMeta && { fn: serverFnMeta.name }),
        start: start.toString()
    }
    try {
        const result = await next()
        const end = Date.now()
        void redis.xAdd('response', "*", {
            ...data,
            end: end.toString(),
            duration: (end - start).toString(),
        }, options)
        return result
    }
    catch (error) {
        const end = Date.now()

        if (error instanceof AppError) {
            void redis.xAdd('response', "*", {
                ...data,
                end: end.toString(),
                duration: (end - start).toString(),
                status: error.status.toString()
            }, options)
            
            throw error
        }
        console.log(error)

        await redis.xAdd('error', "*", {
            ...data,
            end: end.toString(),
            duration: (end - start).toString(),
            status: "500",
        }, options)
        throw new AppError("Something went wrong. Please try again later", HttpStatusCode.INTERNAL_SERVER_ERROR)
    }
})