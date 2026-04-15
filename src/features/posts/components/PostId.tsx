import { PostBlock } from "./PostBlock";
import { type getPostsFn } from "~/serverFn/posts";
import { createSignal } from "solid-js";
import { useServerFn } from "@tanstack/solid-start";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { addCommentFn } from "~/serverFn/comments";

import { CommentList } from "~/features/comments/components/CommentList";
import { CommentInput } from "~/features/comments/components/CommentInput";
import { commentListQueryOpts } from "~/features/comments/utils/commentListQueryOpts";
import { useLocation } from "@tanstack/solid-router";

type Props = {
    post: Awaited<ReturnType<typeof getPostsFn>>[number]
}

export function PostId(props: Props) {
    const commentOnPost = useServerFn(addCommentFn);
    const queryClient = useQueryClient()
    const location = useLocation()

    const [comment, setComment] = createSignal("")
    const mutation = useMutation(() => ({
        mutationFn: commentOnPost,
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
            <PostBlock post={props.post!} />
            <CommentInput
                comment={comment()}
                isPending={mutation.isPending}
                setComment={setComment}
                submit={() => {
                    mutation.mutate({
                        data: {
                            originalPost: props.post.postId,
                            notifyee: props.post.userId,                                                  
                            text: comment(),
                        }
                    })
                }}
            />
        </>
    )
}

