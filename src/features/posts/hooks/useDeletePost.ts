import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useNavigate } from "@tanstack/solid-router"
import { useServerFn } from "@tanstack/solid-start"
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
            queryClient.setQueryData(postsQueryOpts().queryKey, (data) => {
                if (!data) return;
                const pages: typeof data.pages = []
                for (const page of data.pages) {
                    pages.push(page.filter(p => p.postId != post.postId))
                }
                return {...data, pages}
            });
            navigate({to: "/"})
        },
        onError(error, variables, onMutateResult, context) {
            addToast({ text: error.message, type: "error" })
        },
    }))
    return {deleteMutation}
}