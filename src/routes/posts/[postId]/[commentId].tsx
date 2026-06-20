import { useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { Show, Suspense } from "solid-js"
import { CommentBlock } from "~/features/comments/components/CommentBlock"
import { getCommentByIdFn } from "~/services/commentService"

export default function PostIdCommentId() {
    const p = useParams()
    const params = () => ({
        postId: Number(p.postId) || 1,
        commentId: Number(p.commentId) || 1
    })
    const result = useQuery(() => ({
        queryKey: ["comments", params().commentId],
        queryFn: () => getCommentByIdFn(params())
    }))

    return (
        <Show when={result.data}>
            <CommentBlock comment={result.data!} originalPost={params().postId} />
        </Show>
    )
}