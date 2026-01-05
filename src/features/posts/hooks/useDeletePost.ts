import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { Post } from "~/drizzle/models"
import { useToastContext } from "~/hooks/useToastContext"
import { deletePostFn, getPostFn } from "~/serverFn/posts"

export function useDeletePost(post: Awaited<ReturnType<typeof getPostFn>>) {
    const delPost = useServerFn(deletePostFn)
    const { addToast } = useToastContext();
    const queryClient = useQueryClient()
    const deleteMutation = useMutation(() => ({
        mutationFn: delPost,
        onSuccess() {
            addToast({ text: "Post deleted", type: "info" })
            queryClient.setQueryData(["posts"], (data: Post[]) => data?.filter(p => p.postId != post.postId))
        },
        onError(error, variables, onMutateResult, context) {
            addToast({ text: error.message, type: "error" })
        },
    }))
    return {deleteMutation}
}