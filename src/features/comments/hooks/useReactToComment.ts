import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { modifyCommentCache } from "../utils/modifyCommentCache";
import { useToastContext } from "~/hooks/useToastContext";
import { getCommentsByPostIdFn, reactToCommentFn } from "~/services/commentService";
import { createAsync } from "@solidjs/router";
import { getActiveSession } from "~/services/authService";

export function useReactToComment(comment: Awaited<ReturnType<typeof getCommentsByPostIdFn>>[number], postId: number) {
    const queryClient = useQueryClient()
    const session = createAsync(() => getActiveSession())
    const { addToast } = useToastContext()
    const reactMutation = useMutation(() => ({
        mutationFn: reactToCommentFn,
    }))
    function fn(reaction: "like" | "dislike") {
        return function () {
            if (!session()) return addToast({ text: "Please login first", type: "warning" })
            if (!session()?.emailVerified) return addToast({ text: "Please verify your account", type: "warning" })
            reactMutation.mutate({
                commentId: comment.commentId,
                reaction
            }, {
                onSuccess(data, variables, onMutateResult, context) {
                    modifyCommentCache(queryClient, postId, comment.commentId, reaction)
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: error.message, type: "error" })
                },
            })
        }
    }
    return { fn, isPending: () => reactMutation.isPending }
}