"use server"

import { cacheService } from "~/integrations/cacheService";

export async function cacheAside<T>(key: string, fetchFromDb: () => Promise<T>, ttl?: number ) {
    const cached = await cacheService.get<T>(key)
    if (cached) return cached
    const data = await fetchFromDb()
    void cacheService.set(key, data, ttl)
    return data
}