import { and, eq, exists, getColumns, sql, SQL } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { User } from "~/drizzle/models";
import { followerFollowee } from "~/drizzle/schema";
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
                    eq(followerFollowee.followeeId, loggedInUserId),
                    eq(followerFollowee.followerId, userId)
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
                    eq(followerFollowee.followeeId, loggedInUserId),
                    eq(followerFollowee.followerId, sub.userId)
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