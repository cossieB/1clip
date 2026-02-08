import { createMiddleware } from "@tanstack/solid-start";

export const loggerMiddleware = createMiddleware().server(async ({ request, next }) => {
    const now = new Date
    const start = now.getTime()
    try {
        const result = await next()
        const end = Date.now()
        console.log(`[Response] ${request.method} ${request.url} in ${end - start}ms`)
        return result
    } 
    catch (error) {
        const end = Date.now()
        console.error(`[Error] ${request.method} ${request.url} - in ${end - start}ms`)
        throw error
    }
})