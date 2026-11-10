import { getColumns } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { media, posts, postTags } from "~/drizzle/schema";
import type { PostInsert } from "./types";
import "server-only";

export function createPost(obj: PostInsert) {
    const { searchVector, ...columns } = getColumns(posts);

    return db.transaction(async tx => {
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
    });
}
