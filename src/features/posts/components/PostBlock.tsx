import { For, Loading, Show } from "solid-js"
import { PostContent } from "./PostContent"
import styles from "./PostBlock.module.css"
import { mediaSrc } from "~/utils/mediaSrc"
import { toggleLikeFn, type getPostFn } from "../postsApi"
import { HeartIcon, MessageCircleIcon, ShareIcon, TrashIcon } from "@lucide/solid"
import { RenderMedia } from "~/components/RenderMedia"
import { extractFirstVideo } from "../utils/parsePost"
import { IframeFactory } from "./IframeFactory"
import { useToggleLike } from "~/hooks/useToggleLike"
import { session } from "~/features/auth/authApi"
import { paths } from "~/router"
import { HoldClickBtn } from "~/components/HoldClickBtn/HoldClickBtn"
import { useDeletePost } from "../hooks/useDeletePost"
import { PostAuthor } from "~/features/users/components/PostAuthor"
import env from "virtual:solid-env/client"

type Props = {
    post: NonNullable<Awaited<ReturnType<typeof getPostFn>>> & { deleted?: boolean }
    onDelete: () => void
}

export function PostBlock(props: Props) {

    const { like, toggle } = useToggleLike({
        initial: () => ({
            liked: props.post.likedByCurrentUser,
            count: props.post.likeCount,
        }),
        request: () => toggleLikeFn(props.post.postId),
    })

    const wasEdited = () => !!props.post.editedOn
    const externalVideo = () => extractFirstVideo(props.post.text)

    const { deleteAction, deleting } = useDeletePost(props.post.postId, props.onDelete)

    return (
        <article class={["card", styles.post]} data-post-id={props.post.postId}>
            <header class={styles.header}>
                <PostAuthor
                    author={props.post.author}
                    createdAt={props.post.createdAt}
                    edited={wasEdited()}
                    entityId={props.post.postId}
                />

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
                                <a class={styles.tag} href={paths.posts({ tag })}>
                                    #{tag}
                                </a>
                            </li>
                        )}
                    </For>
                </ul>
            </Show>

            <footer class={styles.footer}>
                <div class={styles.actions}>
                    <a
                        class={styles.action}
                        href={paths.posts(props.post.postId)}
                        aria-label={`${props.post.commentCount} comments`}
                    >
                        <MessageCircleIcon />
                        <span>{props.post.commentCount}</span>
                    </a>
                    <Loading>
                        <button
                            type="button"
                            class={["ghost", styles.action, { [styles.liked]: like().liked }]}
                            // aria-pressed={like().liked}
                            aria-label={like().liked ? "Unlike post" : "Like post"}
                            disabled={!session().data}
                            onClick={() => toggle()}
                        >
                            <HeartIcon />
                            <span>{like().count}</span>
                        </button>
                        <Show when={session().data?.user.id === props.post.author.id}>
                            <HoldClickBtn
                                disabled={deleting()}
                                action={async () => deleteAction()}
                                label={<TrashIcon color="var(--danger)" />}
                                variant="danger"
                            />
                        </Show>
                    </Loading>
                    <button
                        onClick={() => navigator.share({
                            title: props.post.title + " :: 1Clip",
                            url: `${env.VITE_SITE_URL}/posts/${props.post.postId}`
                        })}
                        title="Share"
                    >
                        <ShareIcon />
                    </button>
                </div>

                <span class={styles.views}>{props.post.views.toLocaleString("en")} views</span>
            </footer>
        </article>
    )
}