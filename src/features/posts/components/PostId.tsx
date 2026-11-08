import { useParams } from "@solidjs/router";
import { PostBlock } from "./PostBlock";
import { paths } from "~/router";
import { createMemo, Loading, Show } from "solid-js";
import { getPostFn } from "../postsApi";
import { Spinner } from "~/components/Loader/Spinner";
import NotFound from "~/routes/[...404]";

export function PostId() {
    const params = useParams(paths.posts)
    const post = createMemo(() => getPostFn(Number(params.id)), {
        deferStream: true
    })

    return (
        <Loading fallback={<Spinner />}>
            <Show
                fallback={<NotFound />}
                when={post()}
            >
                {post => <PostBlock post={post()} />}
            </Show>
        </Loading>
    )
}