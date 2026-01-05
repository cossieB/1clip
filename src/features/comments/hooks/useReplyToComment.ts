import { useQueryClient, useMutation, QueryClient } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { createStore } from "solid-js/store"
import { addCommentFn, getCommentsByPostIdFn } from "~/serverFn/comments"

export function useReplyToComment(comment: Awaited<ReturnType<typeof getCommentsByPostIdFn>>[number], postId: number) {
    const queryClient = useQueryClient()
    const reply = useServerFn(addCommentFn)

    const [commentState, setCommentState] = createStore({
        showInput: false,
        comment: "",
        showReplies: false
    })

    const replyMutation = useMutation(() => ({
        mutationFn: reply,
        onSuccess() {
            setCommentState({ showReplies: true, comment: "", showInput: false })
            queryClient.invalidateQueries({
                queryKey: ["comments", {
                    postId: postId,
                    replyTo: comment.commentId
                }],
            })
        }
    }))
    return {
        replyMutation,
        commentState,
        setCommentState
    }
}