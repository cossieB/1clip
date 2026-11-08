import { For, Show, action, createOptimistic, createSignal, useContext } from "solid-js"
import { PostContent } from "./PostContent"
import styles from "./PostBlock.module.css"
import { mediaSrc } from "~/utils/mediaSrc"
import { toggleLikeFn, type getPostFn } from "../postsApi"
import { HeartIcon, MessageCircleIcon, TextIcon } from "@lucide/solid"
import { ToastContext } from "~/components/Toast/ToastProvider"
import { RenderMedia } from "~/components/RenderMedia"
import { extractFirstVideo } from "../utils/parsePost"
import { IframeFactory } from "./IframeFactory"

type Props = {
    post: NonNullable<Awaited<ReturnType<typeof getPostFn>>>
    canLike?: boolean
}

// Fixed locale + UTC so server and browser render the same string
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" })

export function PostBlock(props: Props) {
    const { addToast } = useContext(ToastContext)
    // confirmed state, resets whenever the post prop is refetched
    const [likeState, setLikeState] = createSignal(() => ({
        liked: props.post.likedByCurrentUser,
        count: props.post.likeCount,
    }))
    // what the screen shows: optimistic inside the action, confirmed otherwise
    const [like, setLike] = createOptimistic(() => likeState())

    const toggle = action(function* () {
        try {
            const current = likeState()
            setLike({
                liked: !current.liked,
                count: current.count + (current.liked ? -1 : 1),
            })
            const result: Awaited<ReturnType<typeof toggleLikeFn>> = yield toggleLikeFn(props.post.postId)
            if (result) setLikeState({ liked: result.liked, count: result.likeCount })
        }
        catch (error: any) {
            addToast({
                text: error.message ?? "Something went wrong. Please try again later.",
                type: "error"
            })
        }
    })

    const created = () => new Date(props.post.createdAt)
    const wasEdited = () => new Date(props.post.editedOn).getTime() - created().getTime() > 60_000

    const externalVideo = () => extractFirstVideo(props.post.text)

    return (
        <article class={["card", styles.post]} data-post-id={props.post.postId}>
            <header class={styles.header}>
                <a class={styles.author} href={`/users/${props.post.author.username}`}>
                    <img
                        class={["cutout", styles.avatar]}
                        src={mediaSrc(props.post.author.image)}
                        alt=""
                        width="40"
                        height="40"
                    />
                    <span class={styles.names}>
                        <span class={styles.username}>@{props.post.author.username}</span>
                        <span class={styles.meta}>
                            <time datetime={created().toISOString()}>{dateFormat.format(created())}</time>
                            <Show when={wasEdited()}>
                                <span> · edited</span>
                            </Show>
                        </span>
                    </span>
                </a>

                <Show when={props.post.game}>
                    {game => (
                        <a class={["badge", "info", styles.game]} href={`/games/${game().id}`}>
                            {game().title}
                        </a>
                    )}
                </Show>
            </header>

            <h3 class={styles.title}>{props.post.title}</h3>

            <Show when={props.post.text}>
                <PostContent content={props.post.text} />
            </Show>

            <Show when={props.post.media.length}>
                <div class={[styles.media, { [styles.single]: props.post.media.length === 1 }]}>
                    <For each={props.post.media}>
                        {item => (
                            <RenderMedia
                                contentType={item.contentType}
                                url={mediaSrc(item.key)}
                                className={styles.mediaItem}
                            />
                        )}
                    </For>
                </div>
            </Show>
            <Show when={externalVideo() && props.post.media.length === 0}>
                <div class={styles.iframe}>
                    <IframeFactory link={externalVideo()!.url} />
                </div>
            </Show>
            <Show when={props.post.tags.length}>
                <ul class={styles.tags}>
                    <For each={props.post.tags}>
                        {tag => (
                            <li>
                                <a class={styles.tag} href={`/posts/?tag=${tag}`}>
                                    #{tag}
                                </a>
                            </li>
                        )}
                    </For>
                </ul>
            </Show>

            <footer class={styles.footer}>
                <div class={styles.actions}>
                    <button
                        type="button"
                        class={["ghost", styles.action, { [styles.liked]: like().liked }]}
                        // aria-pressed={like().liked}
                        aria-label={like().liked ? "Unlike post" : "Like post"}
                        disabled={props.canLike === false}
                        onClick={() => toggle()}
                    >
                        <HeartIcon />
                        <span>{like().count}</span>
                    </button>

                    <a
                        class={styles.action}
                        href={`/posts/${props.post.postId}#comments`}
                        aria-label={`${props.post.commentCount} comments`}
                    >
                        <MessageCircleIcon />
                        <span>{props.post.commentCount}</span>
                    </a>
                </div>

                <span class={styles.views}>{props.post.views.toLocaleString("en")} views</span>
            </footer>
        </article>
    )
}