import { type QueryClient } from "@tanstack/solid-query";
import { type getCommentsByPostId } from "~/serverFn/comments";

type Comment = Awaited<ReturnType<typeof getCommentsByPostId>>[number]

export function modifyCommentCache(queryClient: QueryClient, postId: number, commentId: number, reaction: "dislike" | "like") {

    queryClient.setQueriesData({queryKey: ["comments"]}, (data: Comment[] | undefined) => {
        if (!data) return undefined;
        const i = data.findIndex(x => x.commentId == commentId);
        if (i == -1) return data;
        const oldPost = data[i]
        const newData = modifyPostInCache(oldPost, reaction)
        return data.toSpliced(i, 1, newData)

    })
}

function modifyPostInCache(oldData: Comment, reaction: "dislike" | "like"): Comment {
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