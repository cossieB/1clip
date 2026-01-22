export interface CacheService {
    set<T>(key: string, value: T, ttl?: number): Promise<unknown>,
    get<T>(key: string): Promise<T | null>
    delete(key: string): Promise<unknown>
}