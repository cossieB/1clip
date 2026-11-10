import { createEffect, createMemo, createSignal, flush, For, onSettled } from "solid-js";
import { PostFilters } from "../utils/zod";
import { getPostsFn } from "../postsApi";
import { useViewPost } from "../hooks/useViewPost";
import { PostBlock } from "./PostBlock";
import { session } from "~/features/auth/authApi";

type Post = Awaited<ReturnType<typeof getPostsFn>>[number]

export function PostList(props: { filters?: PostFilters }) {
    const [cursor, setCursor] = createSignal<NonNullable<Parameters<typeof getPostsFn>[0]>['cursor']>()
    let lastPostId = -1
    let done = false
    const posts = createMemo(async (previous: Post[] = []) => {
        const next = await getPostsFn({
            ...props.filters,
            cursor: cursor()
        })
        if (next.length === 0 ) done = true
        return [...previous, ...next]
    }, {
        loadingValue: [],
    })
    const addPostToSet = useViewPost()
    
    let observer: IntersectionObserver

    createEffect(
        posts,
        () => {
            setTimeout(() => {
                const cards = document.querySelectorAll(`[data-post-id]`); 
                lastPostId = Number((cards.item(cards.length - 1) as HTMLDivElement)?.dataset.postId) || -1
                cards.forEach(card => observer.observe(card))
            }, 50)
        }
    )

    onSettled(() => {
        observer = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                const postId = Number((entry.target as HTMLDivElement).dataset.postId)
                if (entry.isIntersecting) addPostToSet(postId)
                if ((postId == lastPostId) && entry.isIntersecting && !done) {
                    const item = posts().find(post => post.postId === postId)
                    if (item) setCursor({ createdAt: item.createdAt, postId })
                }

            })
        })
        return () => observer?.disconnect()
    })

    return (
        <For each={posts()}>
            {post => <PostBlock
                post={post}
                canLike={session().data?.user.emailVerified === true}
            />}
        </For>
    )
}