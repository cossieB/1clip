import { useParams } from "@solidjs/router";
import { PostBlock } from "./PostBlock";
import { paths } from "~/router";
import { createMemo, Loading, Show } from "solid-js";
import { getPostFn } from "../postsApi";
import { Spinner } from "~/components/Loader/Spinner";
import NotFound from "~/routes/[...404]";
import { CommentList } from "~/features/comments/components/CommentList";
import { httpHeader } from "@solidjs/web";

export function PostId() {
    const params = useParams(paths.posts)
    const post = createMemo(() => getPostFn(Number(params.postId)), {
        deferStream: true
    })
    httpHeader("Cache-Control", "private, max-age=600")
    return (
        <Loading fallback={<Spinner />}>
            <Show
                fallback={<NotFound />}
                when={post()}
            >
                {post => 
                    <div>
                        <PostBlock post={post()} />
                        <CommentList postId={Number(params.postId)} />
                    </div>
                }
            </Show>
        </Loading>
    )
}
