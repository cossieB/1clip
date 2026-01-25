import { onCleanup, onMount } from "solid-js";
import { viewPostFn } from "~/serverFn/posts";

export function useViewPost() {
    const viewedPosts = new Set<number>()
    const aknowledgedViews = new Set<number>()
    let timer: number
    const addPostToSet = (postId: number) => viewedPosts.add(postId)

    async function send() {
        const diff = viewedPosts.difference(aknowledgedViews);
        if (diff.size == 0) return
        await viewPostFn({data: Array.from(diff)})
        diff.forEach(postId => aknowledgedViews.add(postId))
    }
    onMount(() => {
        timer = window.setInterval(() => send(), 1000)
        onCleanup(() => window.clearInterval(timer))

    })
    return addPostToSet
}