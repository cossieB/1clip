import { createMemo, For, Loading } from "solid-js"
import styles from "./Trending.module.css"
import { getTrendingFn } from "~/features/posts/postsApi"
import { paths } from "~/router"
import { TrendingSkeleton } from "~/components/Skeletons/Skeletons"

export function Trending() {
    const trending = createMemo(() => getTrendingFn(), {ssrSource: "client"})
    return (
            <Loading fallback={<TrendingSkeleton />}>
        <section class="card">
                <h2>Trending</h2>
                <ul class={styles.trending}>
                    <For each={trending()}>
                        {tag => <a href={paths.posts({ tag })}> #{tag} </a>}
                    </For>
                </ul>
        </section>
            </Loading>
    )
}