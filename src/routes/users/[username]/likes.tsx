import { useParams } from "@solidjs/router"
import { Suspense } from "solid-js"
import { PostList } from "~/features/posts/components/PostList"

export default function UserLikesRoute() {
    const params = useParams()

    return (
        <Suspense>
            <PostList filters={{likerUsername: params.username}} />
        </Suspense>
    )
}
