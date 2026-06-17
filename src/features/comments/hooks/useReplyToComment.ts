import { useQueryClient, useMutation, QueryClient } from "@tanstack/solid-query"
import { createStore } from "solid-js/store"
import { commentListQueryOpts } from "../utils/commentListQueryOpts"
import { getCommentsByPostIdFn, addCommentFn } from "~/services/comments"

export function useReplyToComment(comment: Awaited<ReturnType<typeof getCommentsByPostIdFn>>[number], postId: number) {
    const queryClient = useQueryClient()

    const [commentState, setCommentState] = createStore({
        showInput: false,
        comment: "",
        showReplies: false
    })

    const replyMutation = useMutation(() => ({
        mutationFn: addCommentFn,
        onSuccess() {
            setCommentState({ showReplies: true, comment: "", showInput: false })
            queryClient.invalidateQueries(commentListQueryOpts({
                    postId: postId,
                    replyTo: comment.commentId
                }))
        }
    }))
    return {
        replyMutation,
        commentState,
        setCommentState
    }
}