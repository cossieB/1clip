import { and, count, eq, exists, getColumns, sql, SQL } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { User } from "~/drizzle/models";
import { commentLikes, comments, followerFollowee, postLikes, posts } from "~/drizzle/schema";
import { users } from "~/drizzle/schema/auth";
import z from "zod";
import { GetUserSchema } from "./utils/zod";
import "server-only"

export async function findUser(input: z.input<typeof GetUserSchema>, loggedInUserId?: string) {
    const { email, emailVerified, createdAt, updatedAt, ...rest } = getColumns(users)
    if (!input.id && !input.username) {
        return null;
    }

    const mainCondition = input.id ? eq(users.id, input.id) : eq(users.username, input.username!);

    const sub = db.$with("sub").as(
        db.select({
            userId: users.id,
        })
            .from(users)
            .where(mainCondition)
    )
    const [user] = await db.with(sub).select({
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

    return user

}

export async function updateUser(userId: string, user: Partial<User>) {
    return db.update(users).set(user).where(eq(users.id, userId)).returning({
        oldAvatar: sql<string>`OLD.image`,
        oldBanner: sql<string>`OLD.banner`
    })
}

export async function toggleFollow(targetUserId: string, currentUserId: string) {


    return db.transaction(async tx => {
        const [target] = await tx
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, targetUserId))
            .limit(1);

        if (!target) return null;

        // Try to unfollow first; if a row was removed, we're done
        const removed = await tx
            .delete(followerFollowee)
            .where(and(
                eq(followerFollowee.followerId, currentUserId),
                eq(followerFollowee.followeeId, targetUserId)
            ))
            .returning({ followerId: followerFollowee.followerId });

        let following = false;

        if (removed.length === 0) {
            await tx
                .insert(followerFollowee)
                .values({ followerId: currentUserId, followeeId: targetUserId })
                .onConflictDoNothing();
            following = true;
        }

        return { following };
    });
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