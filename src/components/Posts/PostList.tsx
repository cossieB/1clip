import { For } from "solid-js";
import { type getPostsByTag } from "~/serverFn/posts";
import { PostBlock } from "./PostBlock";

type Props = {
    posts: Awaited<ReturnType<typeof getPostsByTag>>
}

export function PostList(props: Props) {
    return (
        <For each={props.posts}>
            {post => <PostBlock post={post} /> }
        </For>
    )
}