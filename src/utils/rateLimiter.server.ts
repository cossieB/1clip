import { respond } from "@solidjs/web"
import { redis } from "./redis"
import { HttpStatusCode } from "./statusCodes"
import 'server-only'

export async function rateLimiter(prefix: string, user: string, limit: number, window: number) {
    const key = `${prefix}:${user}`
    const count = await redis.incr(key)
    void redis.expire(key, window, 'NX')
    if (count > limit)
        throw respond("You're doing that too much", {
            status: HttpStatusCode.TOO_MANY_REQUESTS
        })    
}