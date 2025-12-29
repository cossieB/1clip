import { db } from "~/drizzle/db";
import { posts, postTags } from "~/drizzle/schema";

type PostInsert = {
    title: string;
    userId: string;
    gameId?: number;
    media: string[];
    text: string;
    tags: string[]
};

export function createPost(obj: PostInsert) {
    return db.transaction(async tx => {
        const insert = await tx.insert(posts).values(obj).returning()
        const post = insert[0]
        if (obj.tags.length > 0)
            await tx.insert(postTags).values(obj.tags.map(tag => ({postId: post.postId, tag})))
        return post
    })    
}

export function findAll() {
    return db.select({

    })
    .from(posts)
}

export function findById(postId: number) {
    return db.query.posts.findFirst({
        where: {
            postId
        },
        
    })
}