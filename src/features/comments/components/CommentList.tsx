import { createMemo, createOptimisticStore, For, Loading, Show } from "solid-js";
import { getCommentsByPostIdFn } from "./commentsApi";
import { Spinner } from "~/components/Loader/Spinner";
import { CommentBlock } from "./CommentBlock";
import { session } from "~/features/auth/authApi";
import { CommentComposer } from "./CommentComposer";

type Props = {
    postId: number
    replyTo?: number
}

export function CommentList(props: Props) {
    const [comments, setComments] = createOptimisticStore(() => getCommentsByPostIdFn(props), [], {
        key: (item) => item.commentId,
        name: "commentList"
    })
    return (
        <Loading fallback={<Spinner />}>
            <Show when={session().data}>
                <CommentComposer
                    comments={comments}
                    setComments={setComments}
                    postId={props.postId}
                />
            </Show>
            <For each={comments}>
                {comment => <CommentBlock
                    comment={comment}
                    canInteract={session().data?.user.emailVerified && comment.commentId > 0}
                    
                />}
            </For>
        </Loading>
    )
}