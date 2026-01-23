import { AppError } from "./AppError"
import { redis } from "./redis"
import { HttpStatusCode } from "./statusCodes"

export async function rateLimiter(prefix: string, user: string, limit: number, window: number) {
    const key = `${prefix}:${user}`
    const count = await redis.incr(key)
    void redis.expire(key, window, 'NX')
    if (count > limit)
        throw new AppError("You're doing that too much", HttpStatusCode.TOO_MANY_REQUESTS)    
}