import { useQueryClient, UseQueryResult } from "@tanstack/solid-query";
import { createEffect } from "solid-js";
import { getPostsFn } from "~/serverFn/posts";

export function usePostCache(result: UseQueryResult<Awaited<ReturnType<typeof getPostsFn>>>) {
    const queryClient = useQueryClient()
    createEffect(() => {
        if (result.data) {
            for (const post of result.data) {
                queryClient.setQueryData(["posts", post.postId], post)
                queryClient.setQueryData(["users", post.user.userId], post.user)
            }
        }
    })
}