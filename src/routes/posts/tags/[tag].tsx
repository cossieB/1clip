import { useParams } from "@solidjs/router"
import { MySiteTitle } from "~/components/MySiteTitle"
import { PostList } from "~/features/posts/components/PostList"

export default function PostsByTag() {
    const params = useParams()

    return (
        <>
            <MySiteTitle> Posts tagged {params.tag} </MySiteTitle>
            <PostList filters={{tag: params.tag}} />
        </>
    )
}
