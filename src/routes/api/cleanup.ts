import { createFileRoute } from '@tanstack/solid-router'
import { db } from '~/drizzle/db';
import { truncateUserNotifications } from '~/features/notifications/notificationsRepository';
import { storageService } from '~/integrations/storageService/index.server';
import { orphanedFileService } from '~/services/orphanedFileService';

export const Route = createFileRoute('/api/cleanup')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const KEY = request.headers.get("X-JANITOR-KEY")
                if (KEY != process.env.JANITOR_KEY) return new Response(null, {
                    status: 403
                })
                void truncateUserNotifications();
                void deleteOrphanFiles()
                return new Response()
            }
        }
    }
})

async function deleteOrphanFiles() {
    const keys = await orphanedFileService.findOldUploadKeys()
    if (keys.length === 0) return

    const uploads = await Promise.all(keys.map(k => orphanedFileService.getPendingUpload(k)))

    await Promise.allSettled(
        uploads.map(async (upload, i) => {
            const key = keys[i]
            if (!upload) {
                await orphanedFileService.removePendingUpload(key)
                return
            }

            try {
                const fileExists = await storageService.fileExists(upload.key)
                if (fileExists) {
                    const hasDbReference = await checkDb(upload.key, upload.userId)
                    if (!hasDbReference) {
                        await storageService.moveToDeletedBucket(upload.key); 
                        console.log("deleted:", upload.key)
                    }
                }
                await orphanedFileService.removePendingUpload(upload.key)
            }
            catch (err) {
                console.error(`Failed to process orphaned upload ${upload.key}`, err)
            }
        })
    )
}

async function checkDb(key: string, userId: string) {
    if (key.startsWith("users/")) {
        const user = await db.query.users.findFirst({
            columns: {
                image: true, banner: true
            },
            where: {
                id: userId
            }
        })
        if (!user) return false;
        return user.image === key || user.banner === key
    }
    if (key.startsWith("people/")) {
        const actor = await db.query.actors.findFirst({
            where: {
                photo: key
            }
        })
        if (!actor) return false
        return true
    }
    if (key.startsWith("logos/")) {
        const dev = await db.query.developers.findFirst({
            where: {
                logo: key
            }
        })
        if (dev) return true
        const pub = await db.query.publishers.findFirst({
            where: {
                logo: key
            }
        })
        if (pub) return true
        const platform = await db.query.platforms.findFirst({
            where: {
                logo: key
            }
        })
        if (platform) return true
        return false
    }
    if (key.startsWith("media/")) {
        const media = await db.query.media.findFirst({
            where: {
                key: key
            }
        })
        return !!media
    }
    if (key.startsWith("games/")) {
        const gameId = key.match(/^games\/(\d+)\//)?.[1]
        if (!gameId) return false
        const game = await db.query.games.findFirst({
            where: {
                gameId: Number(gameId)
            }
        })
        if (!game) return false;
        if (game.cover === key || game.banner === key) return true;
        const media = await db.query.media.findFirst({
            where: {
                key: key
            }
        })
        return !!media
    }
    console.error("Weird key detected: " + key);
    return true;
}
