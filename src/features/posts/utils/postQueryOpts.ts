import { infiniteQueryOptions, queryOptions } from "@tanstack/solid-query";
import { PostFilters } from "~/repositories/postRepository";
import { getPostFn, getPostsFn } from "~/serverFn/posts";

export function postsQueryOpts(filters: PostFilters = {}) {
    return infiniteQueryOptions({
        queryKey: ["posts", filters],
        queryFn: (key) => getPostsFn({data: {...filters, cursor: key.pageParam}}),
        getNextPageParam: (lastPage) => lastPage.at(-1)?.postId,
        initialPageParam: undefined as number | undefined
    })
}

export function postQueryOpts(postId: number) {
    return queryOptions({
        queryKey: ["post", postId],
        queryFn: () => getPostFn({data: postId})
    })
}