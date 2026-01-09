import { type QueryClient } from "@tanstack/solid-query";
import { type getPostFn } from "~/serverFn/posts";
import { postsQueryOpts } from "./postQueryOpts";

type Post = Awaited<ReturnType<typeof getPostFn>>

export function modifyPostCache(queryClient: QueryClient, postId: number, reaction: "dislike" | "like") {
    queryClient.setQueryData(["post", postId], (data: Post) => modifyPostInCache(data, reaction))
    queryClient.setQueryData(postsQueryOpts().queryKey, (data): Post[] | undefined => {
        if (!data) return undefined
        const i = data.findIndex(x => x.postId == postId);
        if (i == -1) return data;
        const oldPost = data[i]
        const newData = modifyPostInCache(oldPost, reaction)
        return data.toSpliced(i, 1, newData)
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