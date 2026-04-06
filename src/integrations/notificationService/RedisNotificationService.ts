import { redis } from "~/utils/redis";
import type { NotificationService, NotifMessage } from "./notificationService.interface";

export class RedisNotificationService implements NotificationService {
    private consumer: ReturnType<typeof redis.duplicate> | null = null

    setup = async (userId: string) => {
        try {
            await redis.xGroupCreate(`notifications:user:${userId}`, `group:user:${userId}`, '0', {
                MKSTREAM: true
            });
        } 
        catch (err: any) {
            if (!err.message.includes('BUSYGROUP')) throw err;
        }
    }

    private createTempRedis = async () => {
        if (!this.consumer) {
            const consumer = await redis.duplicate().connect()
            this.consumer = consumer
        }
    }

    close = () => {
        this.consumer?.destroy();
        this.consumer = null;
    }

    addNotification = async (userId: string, data: NotifMessage) => {
        const message = { ...data, date: new Date().toISOString() }
        try {
            await redis.xAdd(
                `notifications:user:${userId}`,
                "*",
                message,
                { TRIM: { strategy: 'MAXLEN', strategyModifier: '~', threshold: 20 } }
            )
        }
        catch (error) {

        }
    }
    async *listenForNotifications(userId: string) {
        await this.createTempRedis();
        while (true) {
            try {
                const streams = await this.consumer!
                    .xReadGroup(
                        `group:user:${userId}`,
                        "server-a", {
                        id: ">",
                        key: `notifications:user:${userId}`,
                    }, {
                        BLOCK: 0
                    })

                for (const stream of streams as any) {
                    for (const message of stream?.messages) {
                        const obj = { ...message, message: { ...message.message } } as { id: string, message: Record<string, string> }
                        yield obj
                    }
                }
            }
            catch (error) {
                break
            }
        }
    }
}