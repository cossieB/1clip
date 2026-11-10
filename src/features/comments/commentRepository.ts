import { sql, eq, and, isNull, or, asc, gt, count, InferInsertModel, getColumns, lt, desc } from "drizzle-orm"
import { db } from "~/drizzle/db"
import { commentLikes, comments, posts, users } from "~/drizzle/schema"
import 'server-only'

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
                    ${comments.userId},
                    ${posts.userId}
                )
            `.as("recipient_user_id")
        })
        .from(inserted)
        .innerJoin(posts, eq(posts.postId, inserted.postId))
        .leftJoin(comments, eq(comments.commentId, inserted.replyTo));

    return result[0];
}

export type CommentPagination = {
    limit?: number
    cursor?: number
}

const COMMENTS_DEFAULT_LIMIT = 20;
const COMMENTS_MAX_LIMIT = 100;

export async function findPostComments(
    postId: number,
    replyTo: number | null = null,
    currentUserId?: string,
    { limit, cursor }: CommentPagination = {}
) {
    const pageSize = Math.min(Math.max(limit ?? COMMENTS_DEFAULT_LIMIT, 1), COMMENTS_MAX_LIMIT);

    const paginatedComments = db.$with("paginated_comments").as(
        db.select({
            commentId: comments.commentId,
            postId: comments.postId,
            replyTo: comments.replyTo,
            userId: comments.userId,
            text: comments.text,
            createdAt: comments.createdAt,
            editedOn: comments.editedOn,
        })
            .from(comments)
            .where(and(
                eq(comments.postId, postId),
                replyTo === null ? isNull(comments.replyTo) : eq(comments.replyTo, replyTo),
                cursor !== undefined ? lt(comments.commentId, cursor) : undefined
            ))
            .orderBy(desc(comments.commentId))
            .limit(pageSize)
    );

    const likesAgg = db.$with("likes_agg").as(
        db.select({
            commentId: commentLikes.commentId,
            likeCount: sql<number>`count(*)::int`.as("like_count"),
            likedByCurrentUser: currentUserId
                ? sql<boolean>`bool_or(${commentLikes.userId} = ${currentUserId})`.as("liked_by_current_user")
                : sql<boolean>`false`.as("liked_by_current_user"),
        })
            .from(commentLikes)
            .innerJoin(comments, eq(comments.commentId, commentLikes.commentId))
            .where(eq(comments.postId, postId))
            .groupBy(commentLikes.commentId)
    );

    const repliesAgg = db.$with("replies_agg").as(
        db.select({
            replyTo: comments.replyTo,
            replyCount: sql<number>`count(*)::int`.as("reply_count"),
        })
            .from(comments)
            .where(eq(comments.postId, postId))
            .groupBy(comments.replyTo)
    );

    return db
        .with(paginatedComments, likesAgg, repliesAgg)
        .select({
            commentId: paginatedComments.commentId,
            postId: paginatedComments.postId,
            replyTo: paginatedComments.replyTo,
            text: paginatedComments.text,
            createdAt: paginatedComments.createdAt,
            editedOn: paginatedComments.editedOn,
            author: {
                id: users.id,
                username: users.username,
                image: users.image,
            },
            likeCount: sql<number>`coalesce(${likesAgg.likeCount}, 0)`,
            likedByCurrentUser: sql<boolean>`coalesce(${likesAgg.likedByCurrentUser}, false)`,
            replyCount: sql<number>`coalesce(${repliesAgg.replyCount}, 0)`,
        })
        .from(paginatedComments)
        .innerJoin(users, eq(users.id, paginatedComments.userId))
        .leftJoin(likesAgg, eq(likesAgg.commentId, paginatedComments.commentId))
        .leftJoin(repliesAgg, eq(repliesAgg.replyTo, paginatedComments.commentId))
        .orderBy(desc(paginatedComments.commentId));
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
