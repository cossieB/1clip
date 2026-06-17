import { queryOptions } from "@tanstack/solid-query";
import { getCommentsByPostIdFn } from "~/services/comments";

type Opts = {
    postId: number,
    replyTo?: number
}

export function commentListQueryOpts(key: Opts, enabled = true) {
    return queryOptions({
        enabled,
        queryKey: ["comments", key],
        queryFn: () => getCommentsByPostIdFn(key)
    })
}