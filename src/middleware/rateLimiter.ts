'use server';

import { AppError } from "../utils/AppError"
import { redis } from "../utils/redis"
import { HttpStatusCode } from "../utils/statusCodes"

export async function rateLimiter(prefix: string, user: string, limit: number, window: number) {
    const key = `${prefix}:${user}`
    const count = await redis.incr(key)
    void redis.expire(key, window, 'NX')
    if (count > limit)
        throw new AppError("You're doing that too much", HttpStatusCode.TOO_MANY_REQUESTS)    
}