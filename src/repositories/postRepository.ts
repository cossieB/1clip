import { and, count, desc, eq, getColumns, SQL, sql } from "drizzle-orm";
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

export async function findAll(obj?: Filters) {
    return detailedPosts(obj)
}

export async function findById(postId: number) {
    return (await detailedPosts({ filters: [eq(posts.postId, postId)] })).at(0)
}

function detailedPosts(obj: Filters = { filters: [] }) {
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

    const query = db.with(mediaQuery, tagsQuery, reactionQuery, commentsQuery).select({
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
        comments: sql<number>`COALESCE(${commentsQuery.numComments}, 0)`.as("num_comments")
    })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .leftJoin(mediaQuery, eq(posts.postId, mediaQuery.postId))
        .leftJoin(tagsQuery, eq(posts.postId, tagsQuery.postId))
        .leftJoin(postReactions, eq(posts.postId, postReactions.postId))
        .leftJoin(reactionQuery, eq(posts.postId, postReactions.postId))
        .leftJoin(commentsQuery, eq(posts.postId, commentsQuery.postId))
        .orderBy(desc(posts.createdAt))
        .where(and(...obj.filters))

    if (obj.limit)
        query.limit(obj.limit)
    if (obj.offset)
        query.offset(obj.offset)

    return query
}