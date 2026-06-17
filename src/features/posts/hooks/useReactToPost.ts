import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { modifyPostCache } from "../utils/modifyCache";
import { useToastContext } from "~/hooks/useToastContext";
import { authClient } from "~/auth/authClient";
import { getPostFn, reactToPostFn } from "~/services/postService";

export function useReactToPost(post: Awaited<ReturnType<typeof getPostFn>>) {
    const session = authClient.useSession()
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()

    const mutation = useMutation(() => ({
        mutationFn: reactToPostFn,
    }))

    function fn(reaction: "like" | "dislike") {
        return function () {
            if (!session().data) return addToast({ text: "Please login first", type: "warning" })
            if (!session().data?.user.emailVerified) return addToast({ text: "Please verify your account", type: "warning" })
            mutation.mutate({
                postId: post.postId,
                authorId: post.userId,
                reaction,
            }, {
                onSuccess(data, variables, onMutateResult, context) {
                    modifyPostCache(queryClient, post.postId, reaction)
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: error.message, type: "error" })
                },
            })
        }
    }
    return { fn, isPending: () => mutation.isPending }
}