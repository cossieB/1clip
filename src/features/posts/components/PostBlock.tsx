import { getPostFn } from '~/serverFn/posts'
import { For, Show } from 'solid-js'
import { EllipsisVerticalIcon, EyeIcon, MessageCircleIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-solid'
import { getRelativeTime } from '~/lib/getRelativeTime'
import { formatDate } from '~/lib/formatDate'
import { Link } from '@tanstack/solid-router'
import { Carousel } from '~/components/Carousel/Carousel'
import { STORAGE_DOMAIN } from '~/utils/env'
import { authClient } from '~/auth/authClient'
import { MenuPopover } from '~/components/Popover/MenuPopover'
import { useReactToPost } from '../hooks/useReactToPost'
import { useDeletePost } from '../hooks/useDeletePost'
import { IframeFactory } from '~/components/embeds/IframeFactory'
import { PostAuthor } from './PostAuthor'
import styles from "./Post.module.css"
import { ConfirmDialog } from '~/components/Popover/Confirm'

type Props = {
    post: Awaited<ReturnType<typeof getPostFn>>
}

export function PostBlock(props: Props) {
    const session = authClient.useSession()
    const { fn, isPending } = useReactToPost(props.post)
    const { deleteMutation } = useDeletePost(props.post)

    return (
        <div data-type="post" data-postId={props.post.postId} class={styles.postContainer}>
            <PostAuthor post={props.post} />
            <div class={styles.content}>
                <div class={styles.header}>
                    <h2> {props.post.title} </h2>
                    <span title={formatDate(props.post.createdAt)}>
                        {getRelativeTime(props.post.createdAt)}
                    </span>
                    <button  popoverTarget={'post-popover-' + props.post.postId}>
                        <EllipsisVerticalIcon />
                    </button>
                </div>
                <Show when={props.post.media.length > 0}>
                    <Carousel
                        media={props.post.media.map(m => ({
                            contentType: m.contentType,
                            url: STORAGE_DOMAIN + m.key
                        }))}
                        showNextBtn
                        showPrevBtn
                    />
                </Show>
                <Show when={props.post.link}>
                    <div class={styles.iframe}>
                        <IframeFactory link={props.post.link!} />
                    </div>
                </Show>
                <div class={styles.main} innerHTML={props.post.text} />
                <Show when={props.post.tags.length > 0}>
                    <div class={styles.tags} >
                        <For each={props.post.tags}>
                            {tag =>
                                <div class="cutout">
                                    {tag}
                                    <Link to='/posts/tags/$tag' params={{ tag }} />
                                </div>}
                        </For>
                    </div>
                </Show>
                <Show when={props.post.gameId}>
                    <div class={styles.game}>
                        <img src={STORAGE_DOMAIN + props.post.game?.cover} alt="" />
                        <div>
                            <span> {props.post.game?.title} </span>
                            <span> {props.post.game?.releaseDate.split("-")[0]} </span>
                        </div>
                        <Link to='/posts/games/$gameId' params={{ gameId: props.post.gameId! }} />
                    </div>
                </Show>
                <div class={styles.buttons}>
                    <div>
                        <button><MessageCircleIcon /></button>
                        {props.post.comments}
                    </div>
                    <div>
                        <EyeIcon />
                        {props.post.views}
                    </div>
                    <div class={styles.react} >
                        <button onclick={fn('like')}
                            classList={{ [styles.liked]: props.post.yourReaction === "like" }}
                            disabled={isPending()}
                        >
                            <ThumbsUpIcon />
                        </button>
                        <button
                            onclick={fn('dislike')}
                            classList={{ [styles.disliked]: props.post.yourReaction === "dislike" }}
                            disabled={isPending()}
                        >
                            <ThumbsDownIcon />
                        </button>
                        {props.post.reactions.likes - props.post.reactions.dislikes}
                    </div>

                </div>
                <Link class={styles.a} to='/posts/$postId' params={{ postId: props.post.postId }} />
            </div>
            <MenuPopover
                id={'post-popover-' + props.post.postId}
                style={{ "position-area": "center left" }}
            >
                <ul>
                    <li
                        onClick={() => {
                            navigator.share({
                                title: "Share post",
                                url: "/posts/" + props.post.postId
                            })
                        }}
                    >
                        Share
                    </li>
                    <li>
                        {props.post.user.username}'s Profile
                        <Link to="/users/$username" params={{ username: props.post.user.username }} />
                    </li>
                    <Show when={props.post.gameId}>
                        <li>
                            {props.post.game!.title} Posts
                            <Link to='/posts/games/$gameId' params={{ gameId: props.post.gameId! }} />
                        </li>
                        <li>
                            {props.post.game!.title} Details
                            <Link to='/games/$gameId' params={{ gameId: props.post.gameId! }} />
                        </li>
                    </Show>
                    <Show when={session().data && session().data!.user.id === props.post.userId}>
                        <li
                            onclick={() => {
                                (document.getElementById('del-post-warn-' + props.post.postId) as HTMLDialogElement)?.showModal()
                            }}
                        >
                            Delete
                        </li>
                    </Show>

                </ul>
            </MenuPopover>
            <ConfirmDialog
                id={'del-post-warn-' + props.post.postId}
                headline='Delete Post?'
                onConfirm={() => deleteMutation.mutate({ data: { postId: props.post.postId } })}
            >
            </ConfirmDialog>
        </div>
    )
}