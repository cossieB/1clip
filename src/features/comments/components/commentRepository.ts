import { sql, eq, and, isNull, or, asc, gt, count, InferInsertModel, getColumns } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { db } from "~/drizzle/db"
import { commentLikes, comments, posts, users } from "~/drizzle/schema"

export async function addComment(comment: InferInsertModel<typeof comments>) {
    const inserted = db.$with("inserted").as(
        db.insert(comments)
            .values(comment)
            .returning()
    );

    const result = await db
        .with(inserted)
        .select({
            ...getColumns(inserted),
            recipientUserId: sql<string>`
                COALESCE(
                    ${comments.commentId},
                    ${posts.userId}
                )
            `.as("recipient_user_id")
        })
        .from(inserted)
        .innerJoin(posts, eq(posts.postId, inserted.postId))
        .leftJoin(comments, eq(comments.commentId, inserted.replyTo));

    return result[0];
}

export type CommentCursor = {
    createdAt: Date
    commentId: number
}

export type CommentPagination = {
    limit?: number
    cursor?: CommentCursor
}

const COMMENTS_DEFAULT_LIMIT = 20;
const COMMENTS_MAX_LIMIT = 100;

export async function findPostComments(
    postId: number,
    replyTo: number | null = null,
    currentUserId?: string,
    { limit, cursor }: CommentPagination = {}
) {
    const replies = alias(comments, "replies");
    const pageSize = Math.min(Math.max(limit ?? COMMENTS_DEFAULT_LIMIT, 1), COMMENTS_MAX_LIMIT);

    return db
        .select({
            commentId: comments.commentId,
            postId: comments.postId,
            replyTo: comments.replyTo,
            text: comments.text,
            createdAt: comments.createdAt,
            editedOn: comments.editedOn,
            author: {
                id: users.id,
                username: users.username,
                image: users.image,
            },
            likeCount: sql<number>`(
                select count(*)::int from ${commentLikes}
                where ${commentLikes.commentId} = ${comments.commentId}
            )`.as("like_count"),
            likedByCurrentUser: (currentUserId
                ? sql<boolean>`exists (
                    select 1 from ${commentLikes}
                    where ${commentLikes.commentId} = ${comments.commentId}
                    and ${commentLikes.userId} = ${currentUserId}
                )`
                : sql<boolean>`false`
            ).as("liked_by_current_user"),
            replyCount: sql<number>`(
                select count(*)::int from ${replies}
                where ${replies.replyTo} = ${comments.commentId}
            )`.as("reply_count"),
        })
        .from(comments)
        .innerJoin(users, eq(users.id, comments.userId))
        .where(and(
            eq(comments.postId, postId),
            replyTo === null ? isNull(comments.replyTo) : eq(comments.replyTo, replyTo),
            cursor
                ? or(
                    gt(comments.createdAt, cursor.createdAt),
                    and(eq(comments.createdAt, cursor.createdAt), gt(comments.commentId, cursor.commentId))
                )
                : undefined
        ))
        .orderBy(asc(comments.createdAt), asc(comments.commentId))
        .limit(pageSize);
}

export type CommentWithDetails = Awaited<ReturnType<typeof findPostComments>>[number];

export async function toggleLike(commentId: number, currentUserId: string) {
    return db.transaction(async tx => {
        const [comment] = await tx
            .select({ commentId: comments.commentId, authorId: comments.userId })
            .from(comments)
            .where(eq(comments.commentId, commentId))
            .limit(1);

        if (!comment) return null;

        // Try to unlike first; if a row was removed, we're done
        const removed = await tx
            .delete(commentLikes)
            .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, currentUserId)))
            .returning({ userId: commentLikes.userId });

        let liked = false;

        if (removed.length === 0) {
            await tx
                .insert(commentLikes)
                .values({ commentId, userId: currentUserId })
                .onConflictDoNothing();
            liked = true;
        }

        const [{ likeCount }] = await tx
            .select({ likeCount: count() })
            .from(commentLikes)
            .where(eq(commentLikes.commentId, commentId));

        return { liked, likeCount, authorId: comment.authorId };
    });
}


export async function deleteComment(commentId: number, userId: string) {
    return db.delete(comments).where(and(
        eq(comments.commentId, commentId),
        eq(comments.userId, userId)
    ))
        .returning({ commentId: comments.commentId })
}