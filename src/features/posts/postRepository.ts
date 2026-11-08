import { and, AnyColumn, count, desc, eq, exists, getColumns, gt, inArray, lt, or, SQL, sql } from "drizzle-orm";
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

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function findAll(filters: PostFilters = {}, currentUserId?: string) {
    const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const base = basePostsCte(and(...buildFilterConditions(filters)), limit);
    return selectPostDetails(base, currentUserId);
}

export type PostWithDetails = Awaited<ReturnType<typeof findAll>>[number];

export async function findById(
    postId: number,
    currentUserId?: string,
    includePending = false
): Promise<PostWithDetails | null> {
    const where = and(
        eq(posts.postId, postId),
        includePending ? undefined : eq(posts.pending, false)
    );
    const [post] = await selectPostDetails(basePostsCte(where, 1), currentUserId);
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


function basePostsCte(where: SQL | undefined, limit: number) {
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
        })
            .from(posts)
            .innerJoin(users, eq(users.id, posts.userId))
            .where(where)
            .orderBy(desc(posts.createdAt), desc(posts.postId))
            .limit(limit)
    );
}

type BasePosts = ReturnType<typeof basePostsCte>;

/**
 * Selects the full post shape (author, game, counts, media, tags) on top of a
 * base CTE. Each aggregate is scoped to the post IDs in the base CTE, so only
 * the current page is aggregated (the old findAll aggregated whole tables).
 */
function selectPostDetails(base: BasePosts, currentUserId?: string) {
    const pageIds = (col: AnyColumn) => inArray(col, db.select({ id: base.postId }).from(base));

    const likesAgg = db.$with("likes_agg").as(
        db.select({
            postId: postLikes.postId,
            likeCount: sql<number>`count(*)::int`.as("like_count"),
            likedByCurrentUser: currentUserId
                ? sql<boolean>`bool_or(${postLikes.userId} = ${currentUserId})`.as("liked_by_current_user")
                : sql<boolean>`false`.as("liked_by_current_user"),
        })
            .from(postLikes)
            .where(pageIds(postLikes.postId))
            .groupBy(postLikes.postId)
    );

    const commentsAgg = db.$with("comments_agg").as(
        db.select({
            postId: comments.postId,
            commentCount: sql<number>`count(*)::int`.as("comment_count"),
        })
            .from(comments)
            .where(pageIds(comments.postId))
            .groupBy(comments.postId)
    );

    const mediaAgg = db.$with("media_agg").as(
        db.select({
            postId: media.postId,
            mediaList: sql<Media[]>`json_agg(
                json_build_object(
                    'key', ${media.key},
                    'contentType', ${media.contentType},
                    'metadata', ${media.metadata}
                ) order by ${media.createdAt}
            )`.as("media_list"),
        })
            .from(media)
            .where(pageIds(media.postId))
            .groupBy(media.postId)
    );

    const tagsAgg = db.$with("tags_agg").as(
        db.select({
            postId: postTags.postId,
            tagList: sql<string[]>`json_agg(${postTags.tagName} order by ${postTags.tagName})`.as("tag_list"),
        })
            .from(postTags)
            .where(pageIds(postTags.postId))
            .groupBy(postTags.postId)
    );

    return db
        .with(base, likesAgg, commentsAgg, mediaAgg, tagsAgg)
        .select({
            postId: base.postId,
            title: base.title,
            text: base.text,
            link: base.link,
            views: base.views,
            createdAt: base.createdAt,
            editedOn: base.editedOn,
            author: {
                id: users.id,
                username: users.username,
                image: users.image,
            },
            game: {
                id: games.gameId,
                title: games.title,
            },
            likeCount: sql<number>`coalesce(${likesAgg.likeCount}, 0)`,
            commentCount: sql<number>`coalesce(${commentsAgg.commentCount}, 0)`,
            likedByCurrentUser: sql<boolean>`coalesce(${likesAgg.likedByCurrentUser}, false)`,
            media: sql<Media[]>`coalesce(${mediaAgg.mediaList}, '[]'::json)`,
            tags: sql<string[]>`coalesce(${tagsAgg.tagList}, '[]'::json)`,
        })
        .from(base)
        .innerJoin(users, eq(users.id, base.userId))
        .leftJoin(games, eq(games.gameId, base.gameId))
        .leftJoin(likesAgg, eq(likesAgg.postId, base.postId))
        .leftJoin(commentsAgg, eq(commentsAgg.postId, base.postId))
        .leftJoin(mediaAgg, eq(mediaAgg.postId, base.postId))
        .leftJoin(tagsAgg, eq(tagsAgg.postId, base.postId))
        .orderBy(desc(base.createdAt), desc(base.postId));
}

/** Builds the WHERE conditions for findAll. */
function buildFilterConditions(filters: PostFilters = {}): (SQL | undefined)[] {
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
                    .where(
                        and(
                            eq(postTags.postId, posts.postId),
                            eq(postTags.tagName, filters.tag)
                        )
                    )
            )
        );
    }

    if (filters.likerUsername) {
        conditions.push(
            exists(
                db.select({ one: sql`1` })
                    .from(postLikes)
                    .innerJoin(liker, eq(liker.id, postLikes.userId))
                    .where(
                        and(
                            eq(postLikes.postId, posts.postId),
                            eq(liker.username, filters.likerUsername)
                        )
                    )
            )
        );
    }

    if (filters.followerId) {
        conditions.push(
            exists(
                db.select({ one: sql`1` })
                    .from(followerFollowee)
                    .where(
                        and(
                            eq(followerFollowee.followerId, filters.followerId),
                            eq(followerFollowee.followeeId, posts.userId)
                        )
                    )
            )
        );
    }

    if (filters.cursor) {
        conditions.push(
            or(
                lt(posts.createdAt, filters.cursor.createdAt),
                and(
                    eq(posts.createdAt, filters.cursor.createdAt),
                    lt(posts.postId, filters.cursor.postId)
                )
            )
        );
    }

    if (filters.searchString) {
        conditions.push(
            sql`${posts.searchVector} @@ websearch_to_tsquery('english', ${filters.searchString})`
        );
    }

    return conditions;
}
