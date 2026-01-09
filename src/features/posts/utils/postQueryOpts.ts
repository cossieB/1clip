import { queryOptions } from "@tanstack/solid-query";
import { getPostFn, getPostsFn } from "~/serverFn/posts";

type Filters = {
    username?: string
    authorId?: string,
    likerUsername?: string,
    dislikerUsername?: string
    tag?: string
    limit?: number
    cursor?: number
}

export function postsQueryOpts(filters?: Filters) {
    return queryOptions({
        queryKey: ["posts", filters],
        queryFn: () => getPostsFn({data: filters})
    })
}

export function postQueryOpts(postId: number) {
    return queryOptions({
        queryKey: ["post", postId],
        queryFn: () => getPostFn({data: postId})
    })
}