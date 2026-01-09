import { useQuery } from "@tanstack/solid-query";
import { For, Suspense } from "solid-js";
import { CommentBlock } from "./CommentBlock";
import { commentListQueryOpts } from "../utils/commentListQueryOpts";

export function CommentList(props: { postId: number, replyTo?: number, enabled?: boolean }) {
    const result = useQuery(() => commentListQueryOpts({postId: props.postId, replyTo: props.replyTo}, props.enabled))
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

