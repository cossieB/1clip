import { createEffect, For, onMount } from "solid-js";
import { PostBlock } from "./PostBlock";
import styles from "./Post.module.css"
import { type PostFilters } from "~/repositories/postRepository";
import { usePostQuery } from "../hooks/usePostCache";
import { useViewPost } from "../hooks/useViewPost";

export function PostList(props: { filters?: PostFilters }) {
    const result = usePostQuery(props.filters);
    const addPostToSet = useViewPost()
    let observer: IntersectionObserver

    onMount(() => {
        observer = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                const postId = Number((entry.target as HTMLDivElement).dataset.postid)
                if (entry.isIntersecting) addPostToSet(postId)
                if (i = entries.length - 1)
                    result.fetchNextPage()
            })
        })
    })

    createEffect(() => {
        if (result.data) {
            const cards = document.querySelectorAll<HTMLDivElement>(`[data-type="post"]`)
            cards.forEach(card => observer.observe(card))
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
