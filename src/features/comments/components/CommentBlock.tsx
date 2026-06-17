import { getRelativeTime } from "~/lib/getRelativeTime";
import { MessageCircleIcon, ThumbsUpIcon, ThumbsDownIcon, EllipsisVerticalIcon } from "lucide-solid";
import { CommentInput } from "./CommentInput";
import { Show } from "solid-js";
import styles from "./Comments.module.css"
import { CommentList } from "./CommentList";
import { useReactToComment } from "../hooks/useReactToComment";
import { useReplyToComment } from "../hooks/useReplyToComment";
import { MenuPopover } from "~/components/Popover/MenuPopover";
import { useDeleteComment } from "../hooks/useDeleteComment";
import { authClient } from "~/auth/authClient";
import { ConfirmDialog } from "~/components/Popover/Confirm";
import { PostAuthor } from "~/features/posts/components/PostAuthor";
import { getCommentsByPostIdFn } from "~/services/comments";
import { A } from "@solidjs/router";

type Props = {
    comment: Awaited<ReturnType<typeof getCommentsByPostIdFn>>[number];
    originalPost: number
    replyTo?: number
};

export function CommentBlock(props: Props) {

    const { fn, isPending } = useReactToComment(props.comment, props.originalPost);
    const { setCommentState, commentState, replyMutation } = useReplyToComment(props.comment, props.originalPost)
    const session = authClient.useSession()
    const { deleteMutation } = useDeleteComment(props.comment, props.originalPost, props.replyTo)

    return (
        <div
            data-commentId={props.comment.commentId}
            class={styles.comment}
        >
            <div class={styles.header} >
                <PostAuthor
                    class={styles.user}
                    entityId={props.comment.commentId}
                    user={{ ...props.comment.user, id: props.comment.userId }}
                />
                <span class={styles.createdAt}>{getRelativeTime(props.comment.createdAt)}</span>
                <button popoverTarget={'comment-popover-' + props.comment.commentId}>
                    <EllipsisVerticalIcon />
                </button>
            </div>
            <div class={styles.text}> {props.comment.text} </div>
            <div class={styles.buttons}>
                <div>
                    <button onClick={() => setCommentState('showInput', prev => !prev)}><MessageCircleIcon /></button>
                    {props.comment.replies}
                </div>
                <div class={styles.react} >
                    <button onclick={fn('like')}
                        classList={{ [styles.liked]: props.comment.yourReaction === "like" }}
                        disabled={isPending()}
                    >
                        <ThumbsUpIcon />
                    </button>
                    <button
                        onclick={fn('dislike')}
                        classList={{ [styles.disliked]: props.comment.yourReaction === "dislike" }}
                        disabled={isPending()}
                    >
                        <ThumbsDownIcon />
                    </button>
                    {props.comment.reactions.likes - props.comment.reactions.dislikes}
                </div>
            </div>
            <Show when={commentState.showInput}>
                <CommentInput
                    comment={commentState.comment}
                    isPending={replyMutation.isPending}
                    setComment={comment => setCommentState({ comment })}
                    submit={() => {
                        replyMutation.mutate({
                            originalPost: props.originalPost,
                            text: commentState.comment,
                            replyTo: props.comment.commentId,
                            notifyee: props.comment.userId,
                        })
                    }}
                />
            </Show>
            <Show when={commentState.showReplies == false && props.comment.replies > 0}>
                <button style={{ "color": "var(--neon-pink)" }} onclick={() => setCommentState({ showReplies: true })}>
                    Load replies
                </button>
            </Show>
            <div class={styles.replies}>
                <CommentList
                    originalPost={props.originalPost}
                    originalComment={props.comment.commentId}
                    enabled={commentState.showReplies}
                />
            </div>
            <MenuPopover
                id={"comment-popover-" + props.comment.commentId}
                style={{ "position-anchor": "commentMenuBtn", "position-area": "center left" }}
            >
                <ul>
                    <li>
                        {props.comment.user.username}'s profile
                        <A href={"/users/" + props.comment.user.username}  />
                    </li>
                    <Show when={session().data && session().data!.user.id === props.comment.userId}>
                        <li
                            onclick={() => {
                                (document.getElementById('del-comment-warn-' + props.comment.commentId) as HTMLDialogElement)?.showModal()
                            }}
                        >
                            Delete
                        </li>
                    </Show>
                </ul>
            </MenuPopover>
            <ConfirmDialog
                id={"del-comment-warn-" + props.comment.commentId}
                headline='Delete Comment? '
                onConfirm={() => deleteMutation.mutate(props.comment.commentId)}
            />
        </div>
    )
}