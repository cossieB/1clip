import { queryOptions } from "@tanstack/solid-query";
import { getCommentsByPostIdFn } from "~/serverFn/comments";

export function commentListQueryOpts(postId: number, replyTo?: number, enabled = true) {
    return queryOptions({
        enabled,
        queryKey: ["comments", {
            postId,
            replyTo,
        }],
        queryFn: () => getCommentsByPostIdFn({
            data: {
                postId,
                replyTo,
            }
        })
    })
}