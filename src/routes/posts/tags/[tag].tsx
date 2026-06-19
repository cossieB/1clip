import { useParams } from "@solidjs/router"
import { Suspense } from "solid-js"
import { PostList } from "~/features/posts/components/PostList"

export default function PostsByTag() {
    const params = useParams()

    return (
        <Suspense>
            <PostList filters={{tag: params.tag}} />
        </Suspense>
    )
}
