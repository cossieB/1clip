import { createEffect, For, onMount } from "solid-js";
import { PostBlock } from "./PostBlock";
import styles from "./Post.module.css"
import { type PostFilters } from "~/repositories/postRepository";
import { usePostQuery } from "../hooks/usePostCache";

export function PostList(props: { filters?: PostFilters }) {
    const result = usePostQuery(props.filters)
    let observer: IntersectionObserver
    let lastItem: HTMLDivElement | undefined

    onMount(() => {
        observer = new IntersectionObserver(entries => {
            console.log(entries)
            if (entries.at(-1)!.isIntersecting)
                result.fetchNextPage()
        })
    })

    createEffect(() => {
        if (result.data) {
            const cards = document.querySelectorAll<HTMLDivElement>(`[data-type="post"]`)
            if (cards.length == 0) return;
            lastItem && observer?.unobserve(lastItem)
            lastItem = cards[cards.length - 1]
            observer?.observe(lastItem)
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