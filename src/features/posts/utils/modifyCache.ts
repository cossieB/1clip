import { type QueryClient } from "@tanstack/solid-query";
import { postsQueryOpts } from "./postQueryOpts";
import { getPostFn } from "~/services/postService";

type Post = NonNullable<Awaited<ReturnType<typeof getPostFn>>>

export function modifyPostCache(queryClient: QueryClient, postId: number, reaction: "dislike" | "like") {
    queryClient.setQueryData(["post", postId], (data: Post) => modifyPostInCache(data, reaction))
    queryClient.setQueryData(postsQueryOpts().queryKey, data => {
        if (!data) return undefined
        const pages: typeof data.pages = []
        for (const page of data.pages) {
            const i = page.findIndex(x => x.postId == postId); 
            if (i == -1) {
                pages.push(page);
                continue;
            };
            const oldPost = page[i]; 
            const newData = modifyPostInCache(oldPost, reaction)
            pages.push(page.toSpliced(i, 1, newData))
        }
        return {...data, pages}
    })
}

function modifyPostInCache(oldData: Post, reaction: "dislike" | "like"): Post {
    if (!oldData.yourReaction)
        return {
            ...oldData,
            yourReaction: reaction,
            reactions: {
                dislikes: oldData.reactions.dislikes + (reaction == 'dislike' ? 1 : 0),
                likes: oldData.reactions.likes + (reaction == 'like' ? 1 : 0)
            }
        }
    if (oldData.yourReaction === reaction)
        return {
            ...oldData,
            yourReaction: undefined,
            reactions: {
                dislikes: oldData.reactions.dislikes - (reaction == 'dislike' ? 1 : 0),
                likes: oldData.reactions.likes - (reaction == 'like' ? 1 : 0)
            }
        }
    const reactions = reaction == "dislike" ? {
        dislikes: oldData.reactions.dislikes + 1,
        likes: oldData.reactions.likes - 1
    } : {
        likes: oldData.reactions.likes + 1,
        dislikes: oldData.reactions.dislikes - 1
    }

    return {
        ...oldData,
        yourReaction: reaction,
        reactions
    }
}