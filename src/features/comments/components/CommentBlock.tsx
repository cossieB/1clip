import { Show, action, createOptimistic, createSignal, createUniqueId, onFlush, type ParentProps } from "solid-js"
import type { CommentWithDetails } from "./commentRepository"
import styles from "./CommentBlock.module.css"
import { mediaSrc } from "~/utils/mediaSrc"
import { PostContent } from "~/features/posts/components/PostContent"
import { toggleCommentLikeFn } from "./commentsApi"

const MAX_LENGTH = 255 

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" })

type Props = ParentProps<{
    comment: CommentWithDetails
    canInteract?: boolean 
    /** Receives the trimmed reply text. The box closes once the returned promise resolves. */
    onReply?: (text: string) => unknown
}>

export function CommentBlock(props: Props) {
    const textareaId = createUniqueId()
    let textarea!: HTMLTextAreaElement
    let sending = false

    const [replying, setReplying] = createSignal(false)
    const [showReplies, setShowReplies] = createSignal(false)
    const [draft, setDraft] = createSignal("")

    // ── Likes (same pattern as PostBlock) ──
    const [likeState, setLikeState] = createSignal(() => ({
        liked: props.comment.likedByCurrentUser,
        count: props.comment.likeCount,
    }))
    const [like, setLike] = createOptimistic(() => likeState())

    const toggleLike = action(function* () {
        const current = likeState()
        setLike({
            liked: !current.liked,
            count: current.count + (current.liked ? -1 : 1),
        })
        const result: Awaited<ReturnType<typeof toggleCommentLikeFn>> = yield toggleCommentLikeFn(
            props.comment.commentId,
        )
        if (result) setLikeState({ liked: result.liked, count: result.likeCount })
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

    const submit = action(function* (text: string) {
        if (sending) return
        sending = true
        try {
            yield props.onReply?.(text)
            setDraft("")
            setReplying(false)
        } finally {
            sending = false
        }
    })

    const send = () => {
        const text = draft().trim()
        if (text) submit(text)
    }

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            closeReply()
        } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            send()
        }
    }

    const created = () => new Date(props.comment.createdAt)
    const wasEdited = () => new Date(props.comment.editedOn).getTime() - created().getTime() > 60_000
    const interactive = () => props.canInteract !== false
    const remaining = () => MAX_LENGTH - draft().length

    return (
        <article class={styles.comment}>
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
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path
                                d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 2.7 5 6.1 5c2 0 3.2 1 3.9 2.1h.0C10.7 6 11.9 5 13.9 5c3.4 0 5.2 3.6 3.7 6.9C19.5 16.4 12 21 12 21z"
                                fill={like().liked ? "currentColor" : "none"}
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <span>{like().count}</span>
                    </button>

                    <Show when={props.onReply}>
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
                        send()
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
                    <div class={styles.replies}>{props.children}</div>
                </Show>
            </div>
        </article>
    )
}