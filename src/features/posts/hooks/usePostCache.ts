import { useInfiniteQuery, useQueryClient, UseQueryResult } from "@tanstack/solid-query";
import { createEffect } from "solid-js";
import { PostFilters } from "~/repositories/postRepository";
import { getPostsFn } from "~/serverFn/posts";
import { postsQueryOpts } from "../utils/postQueryOpts";

export function usePostQuery(opts?: PostFilters) {
    const result = useInfiniteQuery(() => postsQueryOpts(opts))
    const queryClient = useQueryClient()

    createEffect(() => {
        if (result.data) {
            for (const post of result.data.pages.flat()) {
                queryClient.setQueryData(["post", post.postId], post)
                queryClient.setQueryData(["users", post.user.userId], post.user)
            }
        }
    })
    return result
}