import { useParams } from "@solidjs/router"
import { Suspense } from "solid-js"
import { PostList } from "~/features/posts/components/PostList"

export default function PostsByGameID() {
    const params = useParams()

    return (
        <Suspense>
            <PostList filters={{gameId: Number(params.gameId)}} />
        </Suspense>
    )
}
