import { type AuthUser } from "~/features/auth/authClient";
import { redis } from "~/utils/redis";
import "server-only"

type UserStatus = {
    gameId: number,
    title: string,
    username: string,
    image: string
}

const ONLINE_WINDOW_MS = 15 * 60 * 1000;
const STATUS_TTL_SECONDS = 60 * 60;
const CLEANUP_EVERY_MS = 60 * 1000;

let lastCleanup = 0;

export class OnlineUsersService {
    static initializeUser = (user: Pick<AuthUser, 'id' | 'displayUsername' | 'image'>) => {
        const key = `userstatus:${user.id}`;
        return redis
            .multi()
            .hSetNX(key, "image", user.image!)
            .hSetNX(key, "username", user.displayUsername!)
            .hSetNX(key, "title", "In Lobby")
            .hSetNX(key, "gameId", "-1")
            .expire(key, STATUS_TTL_SECONDS)
            .zAdd('online_users', {
                score: Date.now(),
                value: user.id
            })
            .exec()
    }

    static getOnlineUsers = async (): Promise<UserStatus[]> => {
        const now = Date.now();
        const cutoff = now - ONLINE_WINDOW_MS;

        const ids = await redis.zRange('online_users', "+inf", cutoff, {
            BY: "SCORE",
            REV: true,
            LIMIT: {
                count: 5,
                offset: 0
            }
        });

        const shouldCleanup = now - lastCleanup > CLEANUP_EVERY_MS;
        if (ids.length === 0 && !shouldCleanup) return []

        const pipeline = redis.multi();
        for (const id of ids) pipeline.hGetAll(`userstatus:${id}`);
        if (shouldCleanup) {
            pipeline.zRemRangeByScore('online_users', '-inf', cutoff);
            lastCleanup = now;
        }

        const results = await pipeline.exec();

        return (results.slice(0, ids.length) as unknown as Record<string, string>[])
            .filter((hash) => Object.keys(hash).length > 0)
            .map((hash) => ({
                ...hash,
                gameId: Number(hash.gameId)
            })) as unknown as UserStatus[]
    }

    static getUserStatus = async (userId: string) => {
        return await redis.hGetAll(`userstatus:${String(userId)}`) as unknown as UserStatus
    }
    static setStatus = (userId: string, status: UserStatus) => {
        const key = `userstatus:${userId}`;
        return redis
            .multi()
            .hSet(key, {
                image: status.image,
                username: status.username,
                title: status.title,
                gameId: String(status.gameId)
            })
            .expire(key, STATUS_TTL_SECONDS)
            .zAdd('online_users', {
                score: Date.now(),
                value: userId
            })
            .exec()
    }
}