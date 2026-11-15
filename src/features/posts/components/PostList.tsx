import { createEffect, For, onCleanup, onMount } from "solid-js";
import { PostBlock } from "./PostBlock";
import styles from "./Post.module.css"
import { type PostFilters } from "~/features/posts/postRepository";
import { usePostQuery } from "../hooks/usePostCache";
import { useViewPost } from "../hooks/useViewPost";

export function PostList(props: { filters?: PostFilters }) {
    const result = usePostQuery(props.filters);
    const addPostToSet = useViewPost()
    let observer: IntersectionObserver
    let lastPostId = -1
    onMount(() => {
        observer = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                const postId = Number((entry.target as HTMLDivElement).dataset.postid)
                if (entry.isIntersecting) addPostToSet(postId)
                if (postId == lastPostId && entry.isIntersecting)
                    result.fetchNextPage()
            })
        })
        onCleanup(() => observer?.disconnect())        
    })

    createEffect(() => {
        if (result.data) {
            setTimeout(() => {
                const cards = document.querySelectorAll(`[data-post-id]`); 
                lastPostId = Number((cards.item(cards.length - 1) as HTMLDivElement)?.dataset.postId) || -1
                cards.forEach(card => observer.observe(card))
            }, 50)
        }
    })

    return (
        <div class={styles.page}>
            <For each={result.data?.pages.flat()}>
                {post => <PostBlock post={post} />}
            </For>
        </div>
    )
}
