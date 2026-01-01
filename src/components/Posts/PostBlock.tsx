import { getPostFn, reactToPost } from '~/serverFn/posts'
import { Carousel } from '../Carousel'
import styles from "./Post.module.css"
import { createEffect, For, Show } from 'solid-js'
import { MessageCircleIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-solid'
import { getRelativeTime } from '~/lib/getRelativeTime'
import { formatDate } from '~/lib/formatDate'
import { Link } from '@tanstack/solid-router'
import { useServerFn } from '@tanstack/solid-start'
import { QueryClient, useMutation, useQueryClient } from '@tanstack/solid-query'

type Props = {
    post: Awaited<ReturnType<typeof getPostFn>>
}

export function PostBlock(props: Props) {
    const react = useServerFn(reactToPost);
    const queryClient = useQueryClient()
    const mutation = useMutation(() => ({
        mutationFn: react
    }))

    function fn(reaction: "like" | "dislike") {
        return function () {
            mutation.mutate({
                data: {
                    postId: props.post.postId,
                    reaction
                }
            }, {
                onSuccess(data, variables, onMutateResult, context) {
                    modifyCache(queryClient, props.post.postId, reaction)
                },
            })
        }
    }

    const didLike = () => {
        if (!props.post.yourReaction) return false
        return props.post.yourReaction === "like"
    }
    const didDislike = () => {
        if (!props.post.yourReaction) return false
        return props.post.yourReaction === "dislike"
    }

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
                <Show when={props.post.media.length > 0}>
                    <Carousel
                        media={props.post.media.map(m => ({
                            contentType: m.contentType,
                            url: import.meta.env.VITE_STORAGE_DOMAIN + m.key
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
                            classList={{ [styles.liked]: didLike() }}
                        >
                            <ThumbsUpIcon />
                        </button>
                        <button
                            onclick={fn('dislike')}
                            classList={{ [styles.disliked]: didDislike() }}
                        >
                            <ThumbsDownIcon />
                        </button>
                        {props.post.reactions.likes - props.post.reactions.dislikes}
                    </div>
                </div>
                <Link class={styles.a} to='/posts/$postId' params={{ postId: props.post.postId }} />
            </div>
        </div>
    )
}

type Post = Awaited<ReturnType<typeof getPostFn>>

function modifyCache(queryClient: QueryClient, postId: number, reaction: "dislike" | "like") {
    queryClient.setQueryData(["posts", postId], (data: Post) => modifyPostInCache(data, reaction))
    queryClient.setQueryData(["posts"], (data: Post[] | undefined): Post[] | undefined => {
        if (!data) return undefined
        const i = data.findIndex(x => x.postId == postId);
        if (i == -1) return data;
        const oldPost = data[i]
        const newData = modifyPostInCache(oldPost, reaction)
        return data.toSpliced(i, 1, newData)
    })
}

function modifyPostInCache(oldData: Post, reaction: "dislike" | "like"): Post {
    if (!oldData.yourReaction)
        return {
            ...oldData,
            yourReaction: reaction,
            reactions: {
                dislikes: oldData.reactions.dislikes + (reaction == 'dislike' ? 1 : 0),
                likes: oldData.reactions.likes + (reaction == 'like' ? 1 : 0)
            }
        }
    if (oldData.yourReaction === reaction)
        return {
            ...oldData,
            yourReaction: undefined,
            reactions: {
                dislikes: oldData.reactions.dislikes - (reaction == 'dislike' ? 1 : 0),
                likes: oldData.reactions.likes - (reaction == 'like' ? 1 : 0)
            }
        }
    const reactions = reaction == "dislike" ? {
        dislikes: oldData.reactions.dislikes + 1,
        likes: oldData.reactions.likes - 1
    } : {
        likes: oldData.reactions.likes + 1,
        dislikes: oldData.reactions.dislikes - 1
    }

    return {
        ...oldData,
        yourReaction: reaction,
        reactions
    }
}