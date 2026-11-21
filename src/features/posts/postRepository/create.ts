import { getColumns } from "drizzle-orm";
import { db, Tx } from "~/drizzle/db";
import { media, posts, postTags } from "~/drizzle/schema";
import type { PostInsert } from "./types";
import "server-only";

export async function createPost(tx: Tx, obj: PostInsert) {
    const { searchVector, ...columns } = getColumns(posts);

    const [post] = await tx.insert(posts).values(obj).returning({ ...columns });

    if (obj.tags.length > 0) {
        await tx.insert(postTags).values(
            obj.tags.map(tagName => ({ postId: post.postId, tagName }))
        );
    }

    if (obj.media.length > 0) {
        await tx.insert(media).values(
            obj.media.map(item => ({
                postId: post.postId,
                key: item.key,
                contentType: item.contentType,
                metadata: item.metadata
            }))
        );
    }

    return post;
}