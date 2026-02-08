import { createMiddleware } from "@tanstack/solid-start";
import { setResponseHeader } from "@tanstack/solid-start/server";

export const staticDataMiddleware = createMiddleware({type: "function"})
    .server(async ({next}) => {
        setResponseHeader("Cache-Control", "max-age=86400, public, immutable, stale-while-revalidate=604800")
        return next()
    })