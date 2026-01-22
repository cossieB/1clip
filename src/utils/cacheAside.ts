import { cacheService } from "~/integrations/cacheService";

export async function cacheAside<T>(key: string, fetchFromDb: () => Promise<T> ) {
    const cached = await cacheService.get<T>(key)
    if (cached) return cached
    const data = await fetchFromDb()
    void cacheService.set(key, data)
    return data
}