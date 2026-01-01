import { and, count, desc, eq, getColumns, inArray, SQL, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { comments, media, postReactions, posts, postTags, users } from "~/drizzle/schema";
import { Filters } from "./types";

type PostInsert = {
    title: string;
    userId: string;
    gameId?: number;
    media: { key: string, contentType: string }[];
    text: string;
    tags: string[]
};

export function createPost(obj: PostInsert) {
    return db.transaction(async tx => {
        const insert = await tx.insert(posts).values(obj).returning()
        const post = insert[0]
        if (obj.tags.length > 0)
            await tx.insert(postTags).values(obj.tags.map(tagName => ({ postId: post.postId, tagName })))
        if (obj.media.length > 0)
            await tx.insert(media).values(obj.media.map(m => ({ postId: post.postId, ...m })))
        return post
    })
}

export async function findAll(obj?: Filters, userId?: string) {
    return detailedPosts(obj, userId)
}

export async function findById(postId: number, userId?: string) {
    return (await detailedPosts({ filters: [eq(posts.postId, postId)] }, userId)).at(0)
}

export async function findByTag(tag: string, obj: Filters = {filters: []}, userId?: string) {
    return detailedPosts({
        ...obj,
        filters: [
            ...obj.filters,
            inArray(
                posts.postId,
                db
                    .select({postId: postTags.postId})
                    .from(postTags)
                    .where(eq(postTags.tagName, tag))
            )
        ]
    }, userId)
}

export async function reactToPost(postId: number, userId: string, reaction: "like" | "dislike") {
    return db.execute(sql`
        WITH deleted AS (
            DELETE FROM post_reactions
            WHERE post_id = ${postId} AND user_id = ${userId}
            RETURNING reaction
        )
        INSERT INTO post_reactions (post_id, user_id, reaction)
        SELECT ${postId}, ${userId}, ${reaction}
        WHERE NOT EXISTS (
            SELECT 1 FROM deleted WHERE reaction = ${reaction}
        );
    `)        
}

function detailedPosts(obj: Filters = { filters: [] }, userId?: string) {
    const mediaQuery = db.$with("mq").as(
        db.select({
            postId: media.postId,
            media: sql`JSONB_AGG(JSONB_BUILD_OBJECT(
                'key', ${media.key},
                'contentType', ${media.contentType}
            ))`.as("m_arr")
        })
            .from(media)
            .groupBy(media.postId)
    )

    const tagsQuery = db.$with("tq").as(
        db.select({
            postId: postTags.postId,
            tags: sql`ARRAY_AGG(tag_name)`.as("tags")
        })
            .from(postTags)
            .groupBy(postTags.postId)
    )

    const reactionQuery = db.$with("rq").as(
        db.select({
            postId: postReactions.postId,
            likes: sql<number>`SUM(CASE WHEN ${postReactions.reaction} = 'like' THEN 1 ELSE 0 END)`.as("likes"),
            dislikes: sql<number>`SUM(CASE WHEN ${postReactions.reaction} = 'dislike' THEN 1 ELSE 0 END)`.as("dislikes"),
        })
        .from(postReactions)
        .groupBy(postReactions.postId)
    )

    const commentsQuery = db.$with("cq").as(
        db.select({
            postId: comments.postId,
            numComments: count().as("num_comments")
        })
        .from(comments)
        .groupBy(comments.postId)
    )

    const userReactionQuery = db.$with("urq").as(
        db.select({
            postId: postReactions.postId,
            reaction: postReactions.reaction
        })
        .from(postReactions)
        .where(eq(postReactions.userId, userId!))
    )

    const query = db.with(mediaQuery, tagsQuery, reactionQuery, commentsQuery, userReactionQuery).select({
        ...getColumns(posts),
        media: sql<{ key: string, contentType: string }[]>`COALESCE(${mediaQuery.media}, '[]'::JSONB)`,
        tags: sql<string[]>`COALESCE(${tagsQuery.tags}, '{}')`,
        user: {
            userId: users.id,
            displayName: users.displayName,
            bio: users.bio,
            image: users.image,
            banner: users.banner,
            username: users.username,
            displayUsername: users.displayName,
            dob: users.dob,
            location: users.location
        },
        reactions: {
            likes: reactionQuery.likes,
            dislikes: reactionQuery.dislikes
        },
        comments: sql<number>`COALESCE(${commentsQuery.numComments}, 0)`.as("num_comments"),
        ...userId && ({
            yourReaction: userReactionQuery.reaction as any as SQL.Aliased<"like" | "dislike" | undefined>
        })
    })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .leftJoin(mediaQuery, eq(posts.postId, mediaQuery.postId))
        .leftJoin(tagsQuery, eq(posts.postId, tagsQuery.postId))
        .leftJoin(reactionQuery, eq(posts.postId, reactionQuery.postId))
        .leftJoin(commentsQuery, eq(posts.postId, commentsQuery.postId))
        .orderBy(desc(posts.createdAt))
        .where(and(...obj.filters))

    if (obj.limit)
        query.limit(obj.limit)
    if (obj.offset)
        query.offset(obj.offset)

    if (userId)
        query.leftJoin(userReactionQuery, eq(userReactionQuery.postId, posts.postId))

    return query
}