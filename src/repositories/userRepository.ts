import { and, count, eq, exists, getColumns, sql, SQL, sum } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import { db } from "~/drizzle/db";
import { User } from "~/drizzle/models";
import { commentReactions, comments, followerFollowee, postReactions, posts } from "~/drizzle/schema";
import { users } from "~/drizzle/schema/auth";

export async function findById(userId: string, loggedInUserId?: string) {
    const { email, emailVerified, createdAt, updatedAt,...rest} = getColumns(users)

    const rows = await db.select({
        ...rest,
        joined: users.createdAt,
        links: users.links,
        ...loggedInUserId && ({
            isFollowing: exists(
                db
                .select({_: sql`1`})
                .from(followerFollowee)
                .where(and(
                    eq(followerFollowee.followerId, loggedInUserId),
                    eq(followerFollowee.followeeId, userId)
                ))
            ) as SQL<boolean>
        })
    })
        .from(users)
        .where(eq(users.id, userId))

    return rows.at(0)        
}

export async function findByUsername(username: string, loggedInUserId?: string) {
    const { email, emailVerified, createdAt, updatedAt,...rest} = getColumns(users)    
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
                .select({_: sql`1`})
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

export function calculateXP(userId: string) {
    const numPosts = db
        .select({
            userId: posts.userId,
            score: count().as("score")
        })
        .from(posts)
        .groupBy(posts.userId)
        .where(eq(posts.userId, userId))

    const postReactionScore = db
        .select({
            userId: posts.userId,
            score: sql<number>`
                LEAST(SUM(
                    CASE 
                        WHEN ${postReactions.reaction} = 'like' THEN 2
                        ELSE -1
                    END
                ), 100)
            `.as("score")
        })
        .from(postReactions)
        .innerJoin(posts, eq(posts.postId, postReactions.postId))
        .groupBy(posts.userId)
        .where(eq(posts.userId, userId))

    const numComments = db
        .select({
            userId: comments.userId,
            score: count().as("score")
        })        
        .from(comments)
        .groupBy(comments.userId)
        .where(eq(comments.userId, userId))

    const commentReactionsScores = db
        .select({
            userId: comments.userId,
            score: sql<number>`
                LEAST(SUM(
                    CASE 
                        WHEN ${commentReactions.reaction} = 'like' THEN 1
                        ELSE -1
                    END
                ), 10)
            `.as("score")
        })
        .from(commentReactions)
        .innerJoin(comments, eq(commentReactions.commentId, comments.commentId))
        .groupBy(comments.userId)
        .where(eq(comments.userId, userId))

    const cte = db.$with("temp").as(unionAll(numPosts, postReactionScore, numComments, commentReactionsScores))

    return db
        .with(cte)
        .select({
            userId: cte.userId,
            reputation: sql<number>`SUM(${cte.score})::INT`
        })
        .from(cte)
        .groupBy(cte.userId)
        .where(eq(cte.userId, userId))
}