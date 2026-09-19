import { storageService } from "~/integrations/storageService/index.server";
import { redis } from "~/utils/redis.server";

export type PendingUpload = {
    userId: string
    key: string
}

const PENDING_UPLOAD_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const PENDING_UPLOADS_ZSET = "pending_uploads"

function pendingUploadKey(key: string) {
    return `pending_upload:${key}`
}

class OrphanedFileService {
    async storePendingUploads(
        urls: Awaited<ReturnType<typeof storageService.generateSignedUrl>>[],
        userId: string
    ) {
        if (urls.length === 0) return

        const multi = redis.multi()
        const expireAt = Date.now() + PENDING_UPLOAD_TTL_MS

        for (const u of urls) {
            const redisKey = pendingUploadKey(u.key)
            multi.hSet(redisKey, { userId, key: u.key })
        }
        multi.zAdd(PENDING_UPLOADS_ZSET, urls.map(u => ({ score: expireAt, value: u.key })))
        await multi.exec()
    }

    async removePendingUpload(key: string) {
        const multi = redis.multi()
        multi.del(pendingUploadKey(key))
        multi.zRem(PENDING_UPLOADS_ZSET, key)
        await multi.exec()
    }

    async getPendingUpload(key: string) {
        const data = await redis.hGetAll(pendingUploadKey(key))
        if (!data || Object.keys(data).length === 0) return null
        return data as PendingUpload
    }

    async findOldUploadKeys(limit = 500): Promise<string[]> {
        return redis.zRangeByScore(PENDING_UPLOADS_ZSET, '-inf', Date.now(), {
            LIMIT: { offset: 0, count: limit }
        })
    }
}

export const orphanedFileService = new OrphanedFileService()