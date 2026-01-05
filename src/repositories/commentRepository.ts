import { InferInsertModel, SQL, and, count, desc, eq, getColumns, isNull, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { commentReactions, comments, users } from "~/drizzle/schema";
import { sleep } from "~/lib/sleep";

export async function addComment(comment: InferInsertModel<typeof comments>) {
    return db.insert(comments).values(comment).returning()
}

export function findCommentsByPostId(postId: number, replyTo?: number, userId?: string) {
    const reactionQuery = db.$with("rq").as(
        db.select({
            commentId: commentReactions.commentId,
            likes: sql<number>`SUM(CASE WHEN ${commentReactions.reaction} = 'like' THEN 1 ELSE 0 END)`.as("likes"),
            dislikes: sql<number>`SUM(CASE WHEN ${commentReactions.reaction} = 'dislike' THEN 1 ELSE 0 END)`.as("dislikes"),
        })
            .from(commentReactions)
            .groupBy(commentReactions.commentId)
    )
    const userReactionQuery = db.$with("urq").as(
        db.select({
            commentId: commentReactions.commentId,
            reaction: commentReactions.reaction
        })
            .from(commentReactions)
            .where(eq(commentReactions.userId, userId!))
    )

    const repliesQuery = db.$with("replyq").as(
        db.select({
            commentId: comments.replyTo,
            numReplies: count().as("num_replies")
        })
            .from(comments)
            .groupBy(comments.replyTo)
    )

    const filter = replyTo ? eq(comments.replyTo, replyTo) : isNull(comments.replyTo);

    const query = db.with(reactionQuery, userReactionQuery, repliesQuery).select({
        ...getColumns(comments),
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
        replies: sql<number>`COALESCE(${repliesQuery.numReplies}, 0)`.as("num_replies"),
        ...userId && ({
            yourReaction: userReactionQuery.reaction as any as SQL.Aliased<"like" | "dislike" | undefined>
        })
    })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(reactionQuery, eq(comments.commentId, reactionQuery.commentId))
        .leftJoin(repliesQuery, eq(comments.commentId, repliesQuery.commentId))
        .where(and(
            eq(comments.postId, postId),
            filter
        ))
        .orderBy(desc(comments.createdAt))

        if (userId)
            query.leftJoin(userReactionQuery, eq(userReactionQuery.commentId, comments.commentId))

        return query
}

export async function deleteComment(commentId: number, userId: string) {
    return db.delete(comments).where(and(
        eq(comments.commentId, commentId),
        eq(comments.userId, userId)
    ))
    .returning({commentId: comments.commentId})
}

export async function reactToComment(commentId: number, userId: string, reaction: "like" | "dislike") {
    return db.execute(sql`
        WITH deleted AS (
            DELETE FROM comment_reactions
            WHERE comment_id = ${commentId} AND user_id = ${userId}
            RETURNING reaction
        )
        INSERT INTO comment_reactions (comment_id, user_id, reaction)
        SELECT ${commentId}, ${userId}, ${reaction}
        WHERE NOT EXISTS (
            SELECT 1 FROM deleted WHERE reaction = ${reaction}
        );
    `)        
}