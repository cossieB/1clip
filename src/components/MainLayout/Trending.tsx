import { createMemo, For, Loading } from "solid-js"
import styles from "./Trending.module.css"
import { getTrendingFn } from "~/features/posts/postsApi"
import { paths } from "~/router"

export function Trending() {
    const trending = createMemo(() => getTrendingFn())
    return (
        <section class="card">
            <Loading>
                <h2>Trending</h2>
                <ul class={styles.trending}>
                    <For each={trending()}>
                        {tag => <a href={paths.posts({ tag })}> #{tag} </a>}
                    </For>
                </ul>
            </Loading>
        </section>
    )
}