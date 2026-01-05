import { getPostFn } from '~/serverFn/posts'
import styles from "./Post.module.css"
import { For, Show } from 'solid-js'
import { EllipsisVerticalIcon, MessageCircleIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-solid'
import { getRelativeTime } from '~/lib/getRelativeTime'
import { formatDate } from '~/lib/formatDate'
import { Link } from '@tanstack/solid-router'
import { Carousel } from '~/components/Carousel/Carousel'
import { STORAGE_DOMAIN } from '~/utils/env'
import { authClient } from '~/auth/authClient'
import { MenuPopover } from '~/components/Popover/MenuPopover'
import { useReactToPost } from '../hooks/useReactToPost'
import { useDeletePost } from '../hooks/useDeletePost'
import { ConfirmPopover, ConfirmPopoverWithButton } from '~/components/Popover/Popover'

type Props = {
    post: Awaited<ReturnType<typeof getPostFn>>
}

export function PostBlock(props: Props) {

    const session = authClient.useSession()
    const { fn } = useReactToPost(props.post)
    const { deleteMutation } = useDeletePost(props.post)

    return (
        <div class={styles.postContainer}>
            <div class={styles.user}>
                <div>
                    <img src={STORAGE_DOMAIN + props.post.user.image} />
                    {props.post.user.displayUsername}
                    <Link to='/users/$username' params={{ username: props.post.user.username! }} />
                </div>
            </div>

            <div class={styles.content}>
                <div class={styles.header}>
                    <h2> {props.post.title} </h2>
                    <span title={formatDate(props.post.createdAt)}>
                        {getRelativeTime(props.post.createdAt)}
                    </span>
                    <button style={{ "--anchor-name": "--postMenuBtn" }} popoverTarget='post-popover'>
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
                <div class={styles.buttons}>
                    <div>
                        <button><MessageCircleIcon /></button>
                        {props.post.comments}
                    </div>
                    <div class={styles.react} >
                        <button onclick={fn('like')}
                            classList={{ [styles.liked]: props.post.yourReaction === "like" }}
                        >
                            <ThumbsUpIcon />
                        </button>
                        <button
                            onclick={fn('dislike')}
                            classList={{ [styles.disliked]: props.post.yourReaction === "dislike" }}
                        >
                            <ThumbsDownIcon />
                        </button>
                        {props.post.reactions.likes - props.post.reactions.dislikes}
                    </div>
                </div>
                <Link class={styles.a} to='/posts/$postId' params={{ postId: props.post.postId }} />
            </div>
            <MenuPopover
                id='post-popover'
                style={{ "position-anchor": "postMenuBtn", "position-area": "bottom left" }}
            >
                <ul>
                    <Show when={session().data && session().data!.user.id === props.post.userId}>
                        <li>
                            <ConfirmPopoverWithButton
                                popover={{
                                    id: "del-post-warn",
                                    text: 'Delete Post?',
                                    onConfirm: () => deleteMutation.mutate({ data: { postId: props.post.postId } })
                                }}
                                button={{
                                    children: "Delete"
                                }}
                            />
                        </li>
                    </Show>
                    <li>
                        <button>
                            Save
                        </button>
                    </li>
                </ul>
            </MenuPopover>
        </div>
    )
}