import { createFileRoute } from "@tanstack/solid-router"
import { getCurrentUser } from "~/serverFn/auth"
import { redis } from "~/utils/redis.server"

export const Route = createFileRoute('/api/stats')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const key = request.headers.get("X-JANITOR-KEY")
                const user = await getCurrentUser();                
                if (user?.role !== "admin" && key !== process.env.JANITOR_KEY) return new Response(null, {status: 403});
                const date = new URL(request.url).searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
                const [pageviews, uniqueVisitors, country, city, continent, path] = await Promise.all([
                    redis.get(`stats:pageviews:${date}`),
                    redis.pfCount(`stats:visitors:${date}`),
                    redis.hGetAll(`stats:country:${date}`),
                    redis.hGetAll(`stats:city:${date}`),
                    redis.hGetAll(`stats:continent:${date}`),
                    redis.hGetAll(`stats:path:${date}`),
                ])

                return Response.json({ date, pageviews: pageviews ?? 0, uniqueVisitors, country, city, continent, path })
            },
        },
    },
})