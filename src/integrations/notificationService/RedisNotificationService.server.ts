import { redis } from "~/utils/redis.server";

export class RedisNotificationService {

    private subscriber: ReturnType<typeof redis.duplicate> | null = null;

    private getSubscriber = async () => {
        if (!this.subscriber) {
            this.subscriber = redis.duplicate();
            await this.subscriber.connect();
        }
        return this.subscriber;
    }

    publish = async (userId: string) => {

        try {
            await redis.publish(`notifications:user:${userId}`, "NEW NOTIFICATION");
        } catch (error) {
            console.error(`Failed to publish notification for user ${userId}`, error);
        }
    }

    subscribe = async (userId: string, onMessage: () => void) => {
        const sub = await this.getSubscriber();

        try {
            await sub.subscribe(`notifications:user:${userId}`, onMessage);
        } catch (error) {
            console.error(`Failed to subscribe to user ${userId}`, error);
        }
    }

    unsubscribe = async (userId: string) => {
        await this.subscriber?.unsubscribe(`notifications:user:${userId}`);
    }

    close = async () => {
        if (!this.subscriber) return;
        await this.subscriber.unsubscribe();
        await this.subscriber.quit();
        this.subscriber = null;
    }
}