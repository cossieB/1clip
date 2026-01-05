import { getRelativeTime } from "~/lib/getRelativeTime";
import { getCommentsByPostIdFn } from "~/serverFn/comments";
import { STORAGE_DOMAIN } from "~/utils/env";
import { MessageCircleIcon, ThumbsUpIcon, ThumbsDownIcon, EllipsisVerticalIcon } from "lucide-solid";
import { CommentInput } from "./CommentInput";
import { Show } from "solid-js";
import styles from "./Comments.module.css"
import { CommentList } from "./CommentList";
import { Link } from "@tanstack/solid-router";
import { useReactToComment } from "../hooks/useReactToComment";
import { useReplyToComment } from "../hooks/useReplyToComment";
import { MenuPopover } from "~/components/Popover/MenuPopover";
import { useDeleteComment } from "../hooks/useDeleteComment";
import { ConfirmPopover, ConfirmPopoverWithButton } from "~/components/Popover/Popover";
import { authClient } from "~/auth/authClient";

type Props = {
    comment: Awaited<ReturnType<typeof getCommentsByPostIdFn>>[number];
    postId: number;
    replyTo?: number
};

export function CommentBlock(props: Props) {

    const { fn } = useReactToComment(props.comment, props.postId);
    const { setCommentState, commentState, replyMutation } = useReplyToComment(props.comment, props.postId)
    const session = authClient.useSession()
    const { deleteMutation } = useDeleteComment(props.comment, props.postId, props.replyTo)

    return (
        <div
            data-commentId={props.comment.commentId}
            class={styles.comment}
        >
            <div class={styles.user}>
                <img
                    src={STORAGE_DOMAIN + props.comment.user.image}
                    alt={`Avatar of ${props.comment.user.username}`}
                />
                <Link to="/users/$username" params={{ username: props.comment.user.username! }}>
                    <span>{props.comment.user.username}</span>
                </Link>
                <span class={styles.createdAt}>{getRelativeTime(props.comment.createdAt)}</span>
                <button style={{ "--anchor-name": "--commentMenuBtn" }} popoverTarget={'comment-popover'+props.comment.commentId}>
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
                    >
                        <ThumbsUpIcon />
                    </button>
                    <button
                        onclick={fn('dislike')}
                        classList={{ [styles.disliked]: props.comment.yourReaction === "dislike" }}
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
                            data: {
                                postId: props.postId,
                                text: commentState.comment,
                                replyTo: props.comment.commentId
                            }
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
                    postId={props.postId}
                    replyTo={props.comment.commentId}
                    enabled={commentState.showReplies}
                />
            </div>
            <MenuPopover
                id={"comment-popover" + props.comment.commentId}
                style={{ "position-anchor": "postMenuBtn", "position-area": "bottom left" }}
            >
                <ul>
                    <Show when={session().data && session().data!.user.id === props.comment.userId}>
                        <li>
                            <ConfirmPopoverWithButton
                                popover={{
                                    id: `del-comment-${props.comment.commentId}`,
                                    text: "Delete Comment?" + props.comment.text,
                                    onConfirm: () => deleteMutation.mutate({
                                        data: {
                                            commentId: props.comment.commentId
                                        }
                                    })
                                }}
                                button={{
                                    children: "Delete"+ props.comment.text
                                }}
                            />
                        </li>
                    </Show>
                </ul>
            </MenuPopover>
        </div>
    )
}