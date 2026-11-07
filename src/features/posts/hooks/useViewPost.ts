import { onCleanup, onSettled } from "solid-js";
import { viewPostFn } from "~/features/posts/postsApi";

export function useViewPost() {
    const viewedPosts = new Set<number>()
    const aknowledgedViews = new Set<number>()
    let timer: number
    const addPostToSet = (postId: number) => viewedPosts.add(postId)

    async function send() {
        const diff = viewedPosts.difference(aknowledgedViews);
        if (diff.size == 0) return
        try {
            await viewPostFn(Array.from(diff))
            diff.forEach(postId => aknowledgedViews.add(postId))
        } catch (error) {

        }
    }
    onSettled(() => {
        timer = window.setInterval(() => send(), 5000)
        return () => window.clearInterval(timer)

    })
    return addPostToSet
}