import { User } from "better-auth";
import { AuthUser } from "~/features/auth/authClient";
import { redis } from "~/utils/redis";

type UserStatus = {
    gameId: number,
    title: string,
    username: string,
    image: string
}

export class OnlineUsersService {
    static initializeUser = (user: Pick<AuthUser, 'id' | 'displayUsername' | 'image'>) => redis
        .multi()
        .hSetNX(`userstatus:${user.id}`, "image", user.image!)
        .hSetNX(`userstatus:${user.id}`, "username", user.displayUsername!)
        .hSetNX(`userstatus:${user.id}`, "title", "In Lobby")
        .hSetNX(`userstatus:${user.id}`, "gameId", "-1")
        .zAdd('online_users', {
            score: Date.now(),
            value: user.id
        })
        .exec()

    static getOnlineUsers = async () => {
        const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
        const ids = await redis.zRange('online_users', "inf", fifteenMinutesAgo, {
            BY: "SCORE",
            REV: true,
            LIMIT: {
                count: 5,
                offset: 0
            }
        });
        void redis.zRemRangeByScore('online_user', '-inf', fifteenMinutesAgo)
        if (ids.length === 0) return []
        return await Promise.all(ids.map(id => redis.hGetAll(`userstatus:${id}`) as unknown as UserStatus));
    }

    static getUserStatus = async (userId: string) => {
        return await redis.hGetAll(`userstatus:${String(userId)}`) as unknown as UserStatus
    }
}