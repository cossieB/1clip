import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useToastContext } from "~/hooks/useToastContext"
import { postsQueryOpts } from "../utils/postQueryOpts"
import { useNavigate } from "@solidjs/router";
import { deletePostFn, getPostFn } from "~/services/postService";

export function useDeletePost(post: NonNullable<Awaited<ReturnType<typeof getPostFn>>>) {
    const navigate = useNavigate()
    const { addToast } = useToastContext();
    const queryClient = useQueryClient()
    const deleteMutation = useMutation(() => ({
        mutationFn: (args: Parameters<typeof deletePostFn>[0]) => deletePostFn(args),
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
            navigate("/posts")
        },
        onError(error, variables, onMutateResult, context) {
            addToast({ text: error.message, type: "error" })
        },
    }))
    return {deleteMutation}
}