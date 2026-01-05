import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { Post } from "~/drizzle/models"
import { useToastContext } from "~/hooks/useToastContext"
import { deleteCommentFn, getCommentsByPostIdFn } from "~/serverFn/comments"

export function useDeleteComment(comment: Awaited<ReturnType<typeof getCommentsByPostIdFn>>[number], postId: number, replyTo?: number) {
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const delComment = useServerFn(deleteCommentFn)
    const deleteMutation = useMutation(() => ({
        mutationFn: delComment,
        onSuccess() {
            queryClient.setQueryData(["comments", {
                postId: postId,
                replyTo: replyTo
            }], (data: {commentId: number}[]) => data?.filter(c => c.commentId != comment.commentId))
        },
        onError(error, variables, onMutateResult, context) {
            addToast({ text: error.message, type: "error" })
        },
    }))
    return {deleteMutation}
}