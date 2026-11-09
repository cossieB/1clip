import { Show, action, createOptimistic, createSignal, createUniqueId, onFlush, useContext, type ParentProps } from "solid-js"
import type { CommentWithDetails } from "./commentRepository"
import styles from "./CommentBlock.module.css"
import { mediaSrc } from "~/utils/mediaSrc"
import { PostContent } from "~/features/posts/components/PostContent"
import { addCommentFn, toggleCommentLikeFn } from "./commentsApi"
import { HeartIcon } from "@lucide/solid"
import { useToggleLike } from "~/hooks/useToggleLike"
import { ToastContext } from "~/components/Toast/ToastProvider"
import { CommentList } from "./CommentList"

const MAX_LENGTH = 255

const dateFormat = new Intl.DateTimeFormat("en-za", { dateStyle: "medium", timeZone: "UTC" })

type Props = ParentProps<{
    comment: CommentWithDetails
    canInteract?: boolean
}>

export function CommentBlock(props: Props) {
    const {addToast} = useContext(ToastContext)
    const textareaId = createUniqueId()
    let textarea!: HTMLTextAreaElement
    const [isCommenting, setIsCommenting] = createOptimistic(false)

    const [replying, setReplying] = createSignal(false)
    const [showReplies, setShowReplies] = createSignal(false)
    const [draft, setDraft] = createSignal("")

    const { like, toggle: toggleLike } = useToggleLike({
        initial: () => ({
            liked: props.comment.likedByCurrentUser,
            count: props.comment.likeCount,
        }),
        request: () => toggleCommentLikeFn(props.comment.commentId),
    })

    // ── Reply box ──
    const openReply = () => {
        setReplying(true)
        // focus after the class change has been applied, otherwise the box is still visibility:hidden
        onFlush(() => textarea.focus({ preventScroll: true }))
    }

    const closeReply = () => {
        setReplying(false)
        setDraft("")
    }

    const submit = action(function* () {
        if (isCommenting()) return
        setIsCommenting(true)
        try {
            yield addCommentFn({
                replyTo: props.comment.commentId,
                text: draft().trim(),
                originalPost: props.comment.postId
            })
            closeReply()
            addToast({text: "Successfully replied", type: "info"})
        }
        catch(error: unknown) {
            addToast({text: error instanceof Error && error.message
                    ? error.message
                    : "Something went wrong. Please try again later.", type: "error"})
        }
    })

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            closeReply()
        } 
        else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            submit()
        }
    }

    const created = () => new Date(props.comment.createdAt)
    const wasEdited = () => new Date(props.comment.editedOn).getTime() - created().getTime() > 60_000
    const interactive = () => props.canInteract !== false
    const remaining = () => MAX_LENGTH - draft().length

    return (
        <article class={[styles.comment, { [styles.pending]: props.comment.commentId < 0 }]}>
            <a href={`/users/${props.comment.author.username}`} class={styles.avatarLink} tabindex="-1" aria-hidden="true">
                <img
                    class={["cutout", styles.avatar]}
                    src={mediaSrc(props.comment.author.image)}
                    alt=""
                    width="32"
                    height="32"
                />
            </a>

            <div class={styles.body}>
                <header class={styles.header}>
                    <a class={styles.username} href={`/users/${props.comment.author.username}`}>
                        @{props.comment.author.username}
                    </a>
                    <span class={styles.meta}>
                        <time datetime={created().toISOString()}>{dateFormat.format(created())}</time>
                        <Show when={wasEdited()}>
                            <span> · edited</span>
                        </Show>
                    </span>
                </header>

                <div class={styles.text}>
                    <PostContent content={props.comment.text} collapsedLines={4} />
                </div>

                <div class={styles.actions}>
                    <button
                        type="button"
                        class={["ghost", styles.action, { [styles.liked]: like().liked }]}
                        // aria-pressed={like().liked}
                        aria-label={like().liked ? "Unlike comment" : "Like comment"}
                        disabled={!interactive()}
                        onClick={() => toggleLike()}
                    >
                        <HeartIcon />
                        <span>{like().count}</span>
                    </button>

                    <Show when={props.canInteract}>
                        <button
                            type="button"
                            class={["ghost", styles.action, { [styles.active]: replying() }]}
                            // aria-expanded={replying()}
                            aria-controls={textareaId}
                            disabled={!interactive()}
                            onClick={() => (replying() ? closeReply() : openReply())}
                        >
                            Reply
                        </button>
                    </Show>

                    <Show when={props.comment.replyCount > 0}>
                        <button
                            type="button"
                            class={["ghost", styles.action, styles.repliesToggle]}
                            // aria-expanded={showReplies()}
                            onClick={() => setShowReplies(v => !v)}
                        >
                            <svg
                                class={[styles.chevron, { [styles.chevronOpen]: showReplies() }]}
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                aria-hidden="true"
                            >
                                <path
                                    d="M6 9l6 6 6-6"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            <span>
                                {props.comment.replyCount} {props.comment.replyCount === 1 ? "reply" : "replies"}
                            </span>
                        </button>
                    </Show>
                </div>

                <form
                    class={styles.composer}
                    onSubmit={e => {
                        e.preventDefault()
                        submit()
                    }}
                >
                    <textarea
                        id={textareaId}
                        ref={textarea}
                        class={[styles.reply, { [styles.open]: replying() }]}
                        value={draft()}
                        maxlength={MAX_LENGTH}
                        placeholder={`Reply to @${props.comment.author.username}…`}
                        aria-label={`Reply to ${props.comment.author.username}`}
                        inert={!replying()}
                        onInput={e => setDraft(e.currentTarget.value)}
                        onKeyDown={onKeyDown}
                    />

                    <Show when={replying()}>
                        <div class={styles.composerActions}>
                            <span class={[styles.counter, { [styles.counterLow]: remaining() < 20 }]}>
                                <Show when={remaining() < 60}>{remaining()}</Show>
                            </span>
                            <button type="button" class="ghost" onClick={closeReply}>
                                Cancel
                            </button>
                            <button type="submit" class="primary" disabled={draft().trim().length === 0}>
                                Reply
                            </button>
                        </div>
                    </Show>
                </form>

                {/* children are only created once opened, so replies can fetch lazily */}
                <Show when={showReplies()}>
                    <div class={styles.replies}>
                        <CommentList
                            postId={props.comment.postId}
                            replyTo={props.comment.commentId}
                        />
                    </div>
                </Show>
            </div>
        </article>
    )
}