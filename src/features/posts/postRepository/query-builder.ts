import { and, desc, eq, exists, lt, SQL, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/drizzle/db";
import { followerFollowee, postLikes, posts, postTags, users } from "~/drizzle/schema";
import { PostFilters } from "../utils/zod";
import "server-only";

export function basePostsCte(where: SQL | undefined, limit: number) {
    return db.$with("base_posts").as(
        db.select({
            postId: posts.postId,
            userId: posts.userId,
            gameId: posts.gameId,
            title: posts.title,
            text: posts.text,
            link: posts.link,
            views: posts.views,
            createdAt: posts.createdAt,
            editedOn: posts.editedOn,
            pending: posts.pending
        })
            .from(posts)
            .innerJoin(users, eq(users.id, posts.userId))
            .where(where)
            .orderBy(desc(posts.postId))
            .limit(limit)
    );
}

export type BasePosts = ReturnType<typeof basePostsCte>;

export function buildFilterConditions(filters: PostFilters = {}): (SQL | undefined)[] {
    const conditions: (SQL | undefined)[] = [];
    const liker = alias(users, "liker");

    if (!filters.includePending) {
        conditions.push(eq(posts.pending, false));
    }

    if (filters.username) {
        conditions.push(eq(users.username, filters.username));
    }

    if (filters.authorId) {
        conditions.push(eq(posts.userId, filters.authorId));
    }

    if (filters.gameId) {
        conditions.push(eq(posts.gameId, filters.gameId));
    }

    if (filters.tag) {
        conditions.push(
            exists(
                db.select({ one: sql`1` })
                    .from(postTags)
                    .where(and(
                        eq(postTags.postId, posts.postId),
                        eq(postTags.tagName, filters.tag)
                    ))
            )
        );
    }

    if (filters.likerUsername) {
        conditions.push(
            exists(
                db.select({ one: sql`1` })
                    .from(postLikes)
                    .innerJoin(liker, eq(liker.id, postLikes.userId))
                    .where(and(
                        eq(postLikes.postId, posts.postId),
                        eq(liker.username, filters.likerUsername)
                    ))
            )
        );
    }

    if (filters.followerId) {
        conditions.push(
            exists(
                db.select({ one: sql`1` })
                    .from(followerFollowee)
                    .where(and(
                        eq(followerFollowee.followerId, filters.followerId),
                        eq(followerFollowee.followeeId, posts.userId)
                    ))
            )
        );
    }

    if (filters.cursor !== undefined) {
        conditions.push(lt(posts.postId, filters.cursor));
    }

    if (filters.searchString) {
        conditions.push(
            sql`${posts.searchVector} @@ websearch_to_tsquery('english', ${filters.searchString})`
        );
    }

    return conditions;
}
