import { For } from "solid-js"
import styles from "./Trending.module.css"

export function Trending() {
    return (
        <section class="card">
            <h2>Trending</h2>
            <ul class={styles.trending}>
                <For each={["clutch", "screenshots", "ragequit"]}>
                    {hash => <a href={""}> #{hash} </a>}
                </For>
            </ul>
        </section>
    )
}