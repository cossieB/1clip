import { queryOptions } from "@tanstack/solid-query";
import { getCommentsByPostIdFn } from "~/serverFn/comments";

type Opts = {
    postId: number,
    replyTo?: number
}

export function commentListQueryOpts(key: Opts, enabled = true) {
    return queryOptions({
        enabled,
        queryKey: ["comments", key],
        queryFn: () => getCommentsByPostIdFn({
            data: key
        })
    })
}