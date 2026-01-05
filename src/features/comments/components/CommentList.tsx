import { useQuery } from "@tanstack/solid-query";
import { For, Suspense } from "solid-js";
import { getCommentsByPostIdFn } from "~/serverFn/comments";
import { CommentBlock } from "./CommentBlock";

export function CommentList(props: { postId: number, replyTo?: number, enabled?: boolean }) {
    const result = useQuery(() => ({
        enabled: props.enabled ?? true,
        queryKey: ["comments", {
                postId: props.postId,
                replyTo: props.replyTo
            }],
        queryFn: () => getCommentsByPostIdFn({
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
                    {comment => <CommentBlock comment={comment} postId={props.postId} replyTo={props.replyTo} />}
                </For>
            </div>
        </Suspense>
    )
}

