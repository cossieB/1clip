import { getRelativeTime } from "~/lib/getRelativeTime";
import { addComment, getCommentsByPostId, reactToComment } from "~/serverFn/comments";
import { STORAGE_DOMAIN } from "~/utils/env";
import { MessageCircleIcon, ThumbsUpIcon, ThumbsDownIcon } from "lucide-solid";
import { useServerFn } from "@tanstack/solid-start";
import { useQueryClient, useMutation } from "@tanstack/solid-query";
import { authClient } from "~/auth/authClient";
import { useToastContext } from "~/hooks/useToastContext";
import { modifyCommentCache } from "../utils/modifyCommentCache";
import { CommentInput } from "./CommentInput";
import { createStore } from "solid-js/store";
import { Show } from "solid-js";
import styles from "./Comments.module.css"
import { CommentList } from "./CommentList";
import { Link } from "@tanstack/solid-router";

export function CommentBlock(props: { comment: Awaited<ReturnType<typeof getCommentsByPostId>>[number], postId: number }) {
    const react = useServerFn(reactToComment);
    const reply = useServerFn(addComment)
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const reactMutation = useMutation(() => ({
        mutationFn: react,
    }))
    const replyMutation = useMutation(() => ({
        mutationFn: reply,
        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: ["comments"]
            })
        }
    }))
    const session = authClient.useSession();

    const [commentState, setCommentState] = createStore({
        showInput: false,
        comment: "",
        showReplies: false
    })

    function fn(reaction: "like" | "dislike") {
        return function () {
            if (!session().data) return addToast({ text: "Please login first", type: "warning" })
            if (!session().data?.user.emailVerified) return addToast({ text: "Please verify your account", type: "warning" })
            reactMutation.mutate({
                data: {
                    commentId: props.comment.commentId,
                    reaction
                }
            }, {
                onSuccess(data, variables, onMutateResult, context) {
                    modifyCommentCache(queryClient, props.postId, props.comment.commentId, reaction)
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: error.message, type: "error" })
                },
            })
        }
    }

    return (
        <div class={styles.comment}>
            <div class={styles.user}>
                <img
                    src={STORAGE_DOMAIN + props.comment.user.image}
                    alt={`Avatar of ${props.comment.user.username}`}
                />
                <Link to="/users/$username" params={{username: props.comment.user.username!}}>
                    <span>{props.comment.user.username}</span>
                </Link>
                <span class={styles.createdAt}>{getRelativeTime(props.comment.createdAt)}</span>
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
                <button style={{"color": "var(--neon-pink)"}} onclick={() => setCommentState({ showReplies: true })}>
                    Load replies
                </button>
            </Show>
            <Show when={commentState.showReplies}>
                <div class={styles.replies}>
                    <CommentList
                        postId={props.postId}
                        replyTo={props.comment.commentId}
                        queryKey={["comments", "replies", props.comment.commentId]}
                    />
                </div>
            </Show>
        </div>
    )
}