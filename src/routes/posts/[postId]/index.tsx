import { redirect, useParams } from "@solidjs/router"
import { CommentList } from "~/features/comments/components/CommentList"

export default function PostIdIndex() {
    const params = useParams()
    const postId = Number(params.postId)
    if (Number.isNaN(postId)) return redirect("/posts")
    return <CommentList originalPost={postId} />
}