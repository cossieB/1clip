import { action, useAction } from "@solidjs/router";
import { onCleanup, onMount } from "solid-js";
import { viewPostFn } from "~/services/postService";

const viewPostAction = action(viewPostFn)

export function useViewPost() {
    const action = useAction(viewPostAction)
    const viewedPosts = new Set<number>()
    const aknowledgedViews = new Set<number>()
    let timer: number
    const addPostToSet = (postId: number) => viewedPosts.add(postId)

    async function send() {
        const diff = viewedPosts.difference(aknowledgedViews);
        if (diff.size == 0) return
        await action(Array.from(diff))
        diff.forEach(postId => aknowledgedViews.add(postId))
    }
    onMount(() => {
        timer = window.setInterval(() => send(), 5000)
        onCleanup(() => window.clearInterval(timer))

    })
    return addPostToSet
}