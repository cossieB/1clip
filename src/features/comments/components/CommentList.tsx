import { useQuery } from "@tanstack/solid-query";
import { For, Suspense } from "solid-js";
import { CommentBlock } from "./CommentBlock";
import { commentListQueryOpts } from "../utils/commentListQueryOpts";

type Props = {
    originalPost: {
        postId: number;
        authorId: string
    }
    originalComment?: {
        commentId: number,
        authorId: string
    }
    enabled?: boolean;
};

export function CommentList(props: Props) {
    const result = useQuery(() => commentListQueryOpts({
        postId: props.originalPost.postId,
        replyTo: props.originalComment?.commentId
    },
        props.enabled))

    return (
        <Suspense>
            <div>
                <For each={result.data ?? []}>
                    {comment =>
                        <CommentBlock
                            comment={comment}
                            originalPost={props.originalPost}
                            replyTo={props.originalComment?.commentId}
                        />}
                </For>
            </div>
        </Suspense>
    )
}

