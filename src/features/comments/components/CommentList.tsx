import { useQuery } from "@tanstack/solid-query";
import { For, Suspense } from "solid-js";
import { getCommentsByPostId } from "~/serverFn/comments";
import { CommentBlock } from "./CommentBlock";

export function CommentList(props: { postId: number, replyTo?: number, queryKey: any[] }) {
    const result = useQuery(() => ({
        queryKey: props.queryKey,
        queryFn: () => getCommentsByPostId({
            data: {
                postId: props.postId,
                replyTo: props.replyTo
            }
        })
    }))
    return (
        <Suspense>
            <div>
                <For each={result.data!}>
                    {comment => <CommentBlock comment={comment} postId={props.postId} />}
                </For>
            </div>
        </Suspense>
    )
}

