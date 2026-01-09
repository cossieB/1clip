import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useNavigate } from "@tanstack/solid-router"
import { useServerFn } from "@tanstack/solid-start"
import { Post } from "~/drizzle/models"
import { useToastContext } from "~/hooks/useToastContext"
import { deletePostFn, getPostFn } from "~/serverFn/posts"
import { postsQueryOpts } from "../utils/postQueryOpts"

export function useDeletePost(post: Awaited<ReturnType<typeof getPostFn>>) {
    const delPost = useServerFn(deletePostFn);
    const navigate = useNavigate()
    const { addToast } = useToastContext();
    const queryClient = useQueryClient()
    const deleteMutation = useMutation(() => ({
        mutationFn: delPost,
        onSuccess() {
            addToast({ text: "Post deleted", type: "info" })
            queryClient.setQueryData(postsQueryOpts().queryKey, (data) => data?.filter(p => p.postId != post.postId));
            navigate({to: "/posts"})
        },
        onError(error, variables, onMutateResult, context) {
            addToast({ text: error.message, type: "error" })
        },
    }))
    return {deleteMutation}
}