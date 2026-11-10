import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { postLikes, posts } from "~/drizzle/schema";
import type { Post } from "~/drizzle/models";
import "server-only";

export async function deletePost(postId: number, userId: string) {
    return db.delete(posts)
        .where(and(
            eq(posts.postId, postId),
            eq(posts.userId, userId)
        ))
        .returning({ postId: posts.postId });
}

export async function viewPosts(postIds: number[]) {
    return db.update(posts)
        .set({ views: sql`${posts.views} + 1` })
        .where(inArray(posts.postId, postIds));
}

export function updatePost(postId: number, post: Partial<Post>) {
    return db.update(posts)
        .set(post)
        .where(eq(posts.postId, postId));
}

export async function toggleLike(postId: number, currentUserId: string) {
    return db.transaction(async tx => {
        const [post] = await tx
            .select({ postId: posts.postId, authorId: posts.userId })
            .from(posts)
            .where(eq(posts.postId, postId))
            .limit(1);

        if (!post) return null;

        const removed = await tx
            .delete(postLikes)
            .where(and(
                eq(postLikes.postId, postId),
                eq(postLikes.userId, currentUserId)
            ))
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
