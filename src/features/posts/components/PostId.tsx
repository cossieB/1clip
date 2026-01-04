import { PostBlock } from "./PostBlock";
import { type getAllPostsFn } from "~/serverFn/posts";
import { createSignal } from "solid-js";
import { useServerFn } from "@tanstack/solid-start";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { addComment } from "~/serverFn/comments";
import styles from "./PostId.module.css"
import { CommentList } from "~/features/comments/components/CommentList";
import { CommentInput } from "~/features/comments/components/CommentInput";

type Props = {
    post: Awaited<ReturnType<typeof getAllPostsFn>>[number]
}

export function PostId(props: Props) {
    const commentOnPost = useServerFn(addComment);
    const queryClient = useQueryClient()
    const [comment, setComment] = createSignal("")
    const mutation = useMutation(() => ({
        mutationFn: commentOnPost,
        onSuccess(data, variables, onMutateResult, context) {
            setComment("")
            queryClient.invalidateQueries({
                queryKey: ["comments", "byPost", props.post.postId]
            })
        },
        onError(error, variables, onMutateResult, context) {

        },
    }))

    return (
        <div class={styles.container}>
            <PostBlock post={props.post!} />
            <CommentInput
                comment={comment()}
                isPending={mutation.isPending}
                setComment={setComment}
                submit={() => {
                    mutation.mutate({
                        data: {
                            postId: props.post.postId,
                            text: comment(),
                        }
                    })
                }}
            />
            <CommentList postId={props.post.postId} queryKey={["comments", "byPost", props.post.postId]} />
        </div>
    )
}

