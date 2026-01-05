import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useServerFn } from "@tanstack/solid-start";
import { modifyCommentCache } from "../utils/modifyCommentCache";
import { authClient } from "~/auth/authClient";
import { useToastContext } from "~/hooks/useToastContext";
import { getCommentsByPostIdFn, reactToCommentFn } from "~/serverFn/comments";

export function useReactToComment(comment: Awaited<ReturnType<typeof getCommentsByPostIdFn>>[number], postId: number) {
    const queryClient = useQueryClient()
    const session = authClient.useSession();
    const { addToast } = useToastContext()
    const react = useServerFn(reactToCommentFn);
    const reactMutation = useMutation(() => ({
        mutationFn: react,
    }))
    function fn(reaction: "like" | "dislike") {
        return function () {
            if (!session().data) return addToast({ text: "Please login first", type: "warning" })
            if (!session().data?.user.emailVerified) return addToast({ text: "Please verify your account", type: "warning" })
            reactMutation.mutate({
                data: {
                    commentId: comment.commentId,
                    reaction
                }
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
    return { fn }
}