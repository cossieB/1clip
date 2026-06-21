import { PostBlock } from "./PostBlock";
import { type getPostsFn } from "~/services/postService";
import { createSignal } from "solid-js";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { addCommentFn } from "~/services/commentService";
import { commentListQueryOpts } from "~/features/comments/utils/commentListQueryOpts";
import { useLocation } from "@solidjs/router";
import CommentInput from "~/features/comments/components/CommentInput";


type Props = {
    post: Awaited<ReturnType<typeof getPostsFn>>[number]
}

export function PostId(props: Props) {
    const queryClient = useQueryClient()
    const location = useLocation()

    const [comment, setComment] = createSignal("")
    const mutation = useMutation(() => ({
        mutationFn: addCommentFn,
        onSuccess(data, variables, onMutateResult, context) {
            setComment("")
            queryClient.invalidateQueries(commentListQueryOpts({
                postId: props.post.postId
            }))
        },
        onError(error, variables, onMutateResult, context) {

        },
    }))

    return (
        <>
            <PostBlock post={props.post} />

            <CommentInput
                comment={comment()}
                isPending={mutation.isPending}
                setComment={setComment}
                submit={() => {
                    mutation.mutate({
                        originalPost: props.post.postId,
                        notifyee: props.post.userId,
                        text: comment(),
                    })
                }}
            />
        </>
    )
}

