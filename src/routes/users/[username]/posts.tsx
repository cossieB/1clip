import { useParams } from "@solidjs/router"
import { PostList } from "~/features/posts/components/PostList"

export default function UserPostsRoute() {
    const params = useParams()
    return (
        <PostList filters={{ username: params.username }} />
    )
}

