import { redis } from "~/utils/redis";
import { CacheService } from "./cacheService.interface";

export class RedisService implements CacheService {
    private redis = redis
    get = async <T>(key: string) => {
        const data = await this.redis.get(key)
        if (data == null) return data
        return JSON.parse(data) as T
    }
    set = async <T>(key: string, value: T, ttl?: number) => {
        const data = JSON.stringify(value)
        if (ttl)
            return this.redis.setEx(key, ttl, data)
        return this.redis.set(key, data)
    }
    delete = async (key1: string, ...keys: string[]) => {
        return this.redis.del([key1, ...keys])
    }
}