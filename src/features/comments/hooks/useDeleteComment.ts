import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useToastContext } from "~/hooks/useToastContext"
import { commentListQueryOpts } from "../utils/commentListQueryOpts"
import { deleteCommentFn, getCommentsByPostIdFn } from "~/services/commentService"

export function useDeleteComment(comment: Awaited<ReturnType<typeof getCommentsByPostIdFn>>[number], postId: number, replyTo?: number) {
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const deleteMutation = useMutation(() => ({
        mutationFn: deleteCommentFn,
        onSuccess() {
            queryClient.setQueryData(
                commentListQueryOpts({postId, replyTo}).queryKey,
                data => data?.filter(c => c.commentId != comment.commentId)
            )
        },
        onError(error, variables, onMutateResult, context) {
            addToast({ text: error.message, type: "error" })
        },
    }))
    return { deleteMutation }
}