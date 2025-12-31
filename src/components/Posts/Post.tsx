import { type getAllPostsFn } from '~/serverFn/posts'
import { Carousel } from '../Carousel'
import styles from "./Post.module.css"
import { For } from 'solid-js'
import { CircleAlertIcon, MessageCircleIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-solid'
import { getRelativeTime } from '~/lib/getRelativeTime'
import { formatDate } from '~/lib/formatDate'
import { Link } from '@tanstack/solid-router'

type Props = {
    post: NonNullable<Awaited<ReturnType<typeof getAllPostsFn>>>[number]
}

export function PostBlock(props: Props) {

    return (
        <div class={styles.container}>
            <div class={styles.user}>
                <img src={props.post.user.image} />
                {props.post.user.displayUsername}
                
            </div>

            <div class={styles.content}>
                <div class={styles.header}>
                    <h2> {props.post.title} </h2>
                    <span title={formatDate(props.post.createdAt)}>
                        {getRelativeTime(props.post.createdAt)}
                    </span>
                </div>
                <Carousel
                    media={props.post.media.map(m => ({
                        contentType: m.contentType,
                        url: import.meta.env.VITE_STORAGE_DOMAIN + m.key
                    }))}
                    showNextBtn
                    showPrevBtn
                />
                <div class={styles.main} innerHTML={props.post.text} />
                <div class={styles.tags} >
                    <For each={props.post.tags}>
                        {tag => <div class="cutout">{tag}</div>}
                    </For>
                </div>
                <div class={styles.buttons}>
                    <div>
                        <button><MessageCircleIcon /></button>
                        {props.post.comments}
                        <button><CircleAlertIcon />  </button>
                    </div>
                    <div class={styles.react} >
                        <button> <ThumbsUpIcon /> </button>
                        <button> <ThumbsDownIcon /> </button>
                        {props.post.reactions.likes - props.post.reactions.dislikes}
                    </div>
                </div>
                <Link class={styles.a} to='/posts/$postId' params={{postId: props.post.postId}} />
            </div>
        </div>
    )
}