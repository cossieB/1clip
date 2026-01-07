import { For } from "solid-js";
import { type getPostsFn } from "~/serverFn/posts";
import { PostBlock } from "./PostBlock";
import styles from "./Post.module.css"

type Props = {
    posts: Awaited<ReturnType<typeof getPostsFn>>
}

export function PostList(props: Props) {
    return (
        <div class={styles.page}>
        <For each={props.posts}>
            {post => <PostBlock post={post} /> }
        </For>
        </div>
    )
}