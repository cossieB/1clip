import { AnyColumn, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { Media } from "~/drizzle/models";
import { comments, games, media, postLikes, postTags, users } from "~/drizzle/schema";
import type { BasePosts } from "./query-builder";
import "server-only";

export function selectPostDetails(base: BasePosts, currentUserId?: string) {
    const pageIds = (col: AnyColumn) =>
        inArray(col, db.select({ id: base.postId }).from(base));

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
            pending: base.pending,
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
        .orderBy(desc(base.postId));
}
