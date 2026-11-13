import { and, eq, exists, getColumns, sql, SQL } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { User } from "~/drizzle/models";
import { commentLikes, comments, followerFollowee, postLikes, posts } from "~/drizzle/schema";
import { users } from "~/drizzle/schema/auth";
import z from "zod";
import { GetUserSchema } from "./utils/zod";
import "server-only"

export async function findUser(input: z.input<typeof GetUserSchema>) {
    const { email, emailVerified, createdAt, updatedAt, ...rest } = getColumns(users)
    if (!input.id && !input.username) {
        return null;
    }

    const mainCondition = input.id ? eq(users.id, input.id) : eq(users.username, input.username!);

    const [user] = await db.select({
        ...rest,
        joined: users.createdAt,
        links: users.links,        
    })
        .from(users)
        .where(mainCondition)

    return user ?? null
}

export async function findByUsername(username: string, loggedInUserId?: string) {
    const { email, emailVerified, createdAt, updatedAt, ...rest } = getColumns(users)
    const sub = db.$with("sub").as(
        db.select({
            userId: users.id,
        })
            .from(users)
            .where(eq(users.username, username))
    )
    const rows = await db.with(sub).select({
        ...rest,
        joined: users.createdAt,
        links: users.links,
        ...loggedInUserId && ({
            isFollowing: exists(
                db
                    .select({ _: sql`1` })
                    .from(followerFollowee)
                    .where(and(
                        eq(followerFollowee.followerId, loggedInUserId),
                        eq(followerFollowee.followeeId, sub.userId)
                    ))
            ) as SQL<boolean>
        })
    })
        .from(users)
        .innerJoin(sub, eq(sub.userId, users.id))
        .where(eq(users.id, sub.userId))

    return rows.at(0)
}

export async function updateUser(userId: string, user: Partial<User>) {
    return db.update(users).set(user).where(eq(users.id, userId)).returning({
        oldAvatar: sql<string>`OLD.image`,
        oldBanner: sql<string>`OLD.banner`
    })
}

export async function followUser(followerId: string, followeeId: string) {
    return db.execute(sql`
            WITH deleted AS (
                DELETE FROM ${followerFollowee}
                WHERE ${followerFollowee.followerId} = ${followerId} AND ${followerFollowee.followeeId} = ${followeeId}
                RETURNING follower_id, followee_id
            )
            INSERT INTO ${followerFollowee} (follower_id, followee_id)
            SELECT ${followerId}, ${followeeId}
            WHERE NOT EXISTS (
                SELECT 1 FROM deleted WHERE follower_id = ${followerId} AND followee_id = ${followeeId}
            )
            RETURNING *
        `)
}

export async function calculateXP(userId: string) {
    const result = await db.execute(sql`
    WITH user_posts AS (
      SELECT post_id FROM ${posts} WHERE user_id = ${userId}
    ),
    post_capped_likes AS (
      SELECT LEAST(COUNT(pl.user_id), 10) AS capped_likes
      FROM user_posts up
      LEFT JOIN ${postLikes} pl ON up.post_id = pl.post_id
      GROUP BY up.post_id
    ),
    user_comments AS (
      SELECT comment_id FROM ${comments} WHERE user_id = ${userId}
    ),
    comment_capped_likes AS (
      SELECT LEAST(COUNT(cl.user_id), 5) AS capped_likes
      FROM user_comments uc
      LEFT JOIN ${commentLikes} cl ON uc.comment_id = cl.comment_id
      GROUP BY uc.comment_id
    )
    SELECT 
      (SELECT COUNT(*) FROM ${posts} WHERE user_id = ${userId}) AS posts_count,
      (SELECT COALESCE(SUM(capped_likes), 0) FROM post_capped_likes) AS post_likes_xp,
      (SELECT COALESCE(SUM(capped_likes), 0) FROM comment_capped_likes) AS comment_likes_xp
  `);

    const row = result.rows[0] as {
        posts_count: string | number;
        post_likes_xp: string | number;
        comment_likes_xp: string | number;
    };

    const totalXP = Number(row.posts_count) + Number(row.post_likes_xp) + Number(row.comment_likes_xp);

    return totalXP;
}