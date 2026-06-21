import { Title } from "@solidjs/meta"
import { useParams } from "@solidjs/router"
import { PostList } from "~/features/posts/components/PostList"

export default function PostsByTag() {
    const params = useParams()

    return (
        <>
            <Title> Posts tagged {params.tag} </Title>
            <PostList filters={{tag: params.tag}} />
        </>
    )
}
