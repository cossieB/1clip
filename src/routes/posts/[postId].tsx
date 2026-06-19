import { redirect, useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { JSXElement, Suspense } from "solid-js"
import { PostId } from "~/features/posts/components/PostId"
import { postQueryOpts } from "~/features/posts/utils/postQueryOpts"
import styles from "~/features/posts/components/PostId.module.css"
import { CommentList } from "~/features/comments/components/CommentList"

export default function PostIdRoute(props: {children: JSXElement}) {
    const params = useParams()
    const postId = Number(params.postId)
    if (Number.isNaN(postId)) return redirect("/posts")
    const result = useQuery(() => postQueryOpts(postId))


    return (
        <div class={styles.container}>
            <Suspense>
                <PostId post={result.data!} />
                {props.children}
                <CommentList originalPost={postId}  />
            </Suspense>
        </div>
    )
}