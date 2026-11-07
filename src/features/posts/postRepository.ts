import { and, count, desc, eq, exists, getColumns, gt, inArray, lt, or, SQL, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/drizzle/db";
import { Media, Post } from "~/drizzle/models";
import { comments, followerFollowee, games, media, postLikes, posts, postTags, users } from "~/drizzle/schema";
import { PostFilters } from "./utils/zod";
import "server-only"

type PostInsert = {
    title: string;
    userId: string;
    gameId?: number;
    media: {
        key: string,
        contentType: string,
        metadata?: Record<string, string>
    }[];
    text: string;
    tags: string[],
    pending: boolean
};


export function createPost(obj: PostInsert) {
    const { searchVector, ...columns } = getColumns(posts)
    return db.transaction(async tx => {
        const insert = await tx.insert(posts).values(obj).returning({ ...columns })
        const post = insert[0]
        if (obj.tags.length > 0)
            await tx.insert(postTags).values(obj.tags.map(tagName => ({ postId: post.postId, tagName })))
        if (obj.media.length > 0)
            await tx.insert(media).values(obj.media.map(m => ({
                postId: post.postId,
                key: m.key,
                contentType: m.contentType,
                metadata: m.metadata
            })))
        return post
    })
}

function postSelection(currentUserId?: string) {
    return {
        postId: posts.postId,
        title: posts.title,
        text: posts.text,
        link: posts.link,
        views: posts.views,
        createdAt: posts.createdAt,
        editedOn: posts.editedOn,
        author: {
            id: users.id,
            username: users.username,
            image: users.image,
        },
        game: {
            id: games.gameId,
            title: games.title,
        },
        likeCount: sql<number>`(
            select count(*)::int from ${postLikes}
            where ${postLikes.postId} = ${posts.postId}
        )`.as("like_count"),
        commentCount: sql<number>`(
            select count(*)::int from ${comments}
            where ${comments.postId} = ${posts.postId}
        )`.as("comment_count"),
        likedByCurrentUser: (currentUserId
            ? sql<boolean>`exists (
                select 1 from ${postLikes}
                where ${postLikes.postId} = ${posts.postId}
                and ${postLikes.userId} = ${currentUserId}
            )`
            : sql<boolean>`false`
        ).as("liked_by_current_user"),
        media: sql<Media[]>`coalesce((
            select json_agg(
                json_build_object(
                    'key', ${media.key},
                    'contentType', ${media.contentType},
                    'metadata', ${media.metadata}
                ) order by ${media.createdAt}
            )
            from ${media}
            where ${media.postId} = ${posts.postId}
        ), '[]'::json)`.as("media"),
        tags: sql<string[]>`coalesce((
            select json_agg(${postTags.tagName} order by ${postTags.tagName})
            from ${postTags}
            where ${postTags.postId} = ${posts.postId}
        ), '[]'::json)`.as("tags"),
    };
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function findAll(filters: PostFilters = {}, currentUserId?: string) {
    const liker = alias(users, "liker");
    const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const conditions: (SQL | undefined)[] = []
    if (filters.includePending) conditions.push(eq(posts.pending, false))
    if (filters.username) conditions.push(eq(users.username, filters.username))
    if (filters.authorId) conditions.push(eq(posts.userId, filters.authorId))
    if (filters.gameId) conditions.push(eq(posts.gameId, filters.gameId))
    if (filters.tag)
        conditions.push(exists(
            db.select({ one: sql`1` })
                .from(postTags)
                .where(and(eq(postTags.postId, posts.postId), eq(postTags.tagName, filters.tag)))
        ))

    if (filters.likerUsername)
        conditions.push(exists(
            db.select({ one: sql`1` })
                .from(postLikes)
                .innerJoin(liker, eq(liker.id, postLikes.userId))
                .where(and(eq(postLikes.postId, posts.postId), eq(liker.username, filters.likerUsername)))
        ))

    if (filters.followerId)
        conditions.push(exists(
            db.select({ one: sql`1` })
                .from(followerFollowee)
                .where(and(
                    eq(followerFollowee.followerId, filters.followerId),
                    eq(followerFollowee.followeeId, posts.userId)
                ))
        ))

    if (filters.cursor)
        conditions.push(or(
            lt(posts.createdAt, filters.cursor.createdAt),
            and(eq(posts.createdAt, filters.cursor.createdAt), lt(posts.postId, filters.cursor.postId))
        ))

    return db
        .select(postSelection(currentUserId))
        .from(posts)
        .innerJoin(users, eq(users.id, posts.userId))
        .leftJoin(games, eq(games.gameId, posts.gameId))
        .where(and(...conditions))
        .orderBy(desc(posts.createdAt), desc(posts.postId))
        .limit(limit);
}

export type PostWithDetails = Awaited<ReturnType<typeof findAll>>[number];

export async function findById(postId: number, currentUserId?: string, includePending = false): Promise<PostWithDetails | null> {
    const [post] = await db
        .select(postSelection(currentUserId))
        .from(posts)
        .innerJoin(users, eq(users.id, posts.userId))
        .leftJoin(games, eq(games.gameId, posts.gameId))
        .where(and(
            eq(posts.postId, postId),
            includePending ? undefined : eq(posts.pending, false)
        ))
        .limit(1);

    return post ?? null;
}

export async function deletePost(postId: number, userId: string) {
    return db.delete(posts).where(and(
        eq(posts.postId, postId),
        eq(posts.userId, userId)
    ))
        .returning({ postId: posts.postId })
}

export async function viewPosts(postIds: number[]) {
    return db.update(posts).set({ views: sql`${posts.views} + 1` }).where(inArray(posts.postId, postIds))
}

export function searchPosts(query: string, currentUserId?: string) {

    return db.select(postSelection(currentUserId))
        .from(posts)
        .innerJoin(users, eq(users.id, posts.userId))
        .leftJoin(games, eq(games.gameId, posts.gameId))
        .where(sql`${posts.searchVector} @@ websearch_to_tsquery('english', ${query})`)
}

export function updatePost(postId: number, post: Partial<Post>) {
    return db.update(posts).set(post).where(eq(posts.postId, postId))
}

export async function toggleLike(postId: number, currentUserId: string) {
    return db.transaction(async tx => {
        const [post] = await tx
            .select({ postId: posts.postId, authorId: posts.userId })
            .from(posts)
            .where(eq(posts.postId, postId))
            .limit(1);

        if (!post) return null;

        // Try to unlike first; if a row was removed, we're done
        const removed = await tx
            .delete(postLikes)
            .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, currentUserId)))
            .returning({ userId: postLikes.userId });

        let liked = false;

        if (removed.length === 0) {
            await tx
                .insert(postLikes)
                .values({ postId, userId: currentUserId })
                .onConflictDoNothing();
            liked = true;
        }

        const [{ likeCount }] = await tx
            .select({ likeCount: count() })
            .from(postLikes)
            .where(eq(postLikes.postId, postId));

        return { liked, likeCount, authorId: post.authorId };
    });
}