import { redirect, useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { JSXElement, Match, Show, Switch } from "solid-js"
import { PostId } from "~/features/posts/components/PostId"
import { postQueryOpts } from "~/features/posts/utils/postQueryOpts"
import styles from "~/features/posts/components/PostId.module.css"
import NotFound from "../[...404]"
import { HttpStatusCode } from "@solidjs/start";
import { Title } from "@solidjs/meta"

export default function PostIdRoute(props: { children: JSXElement }) {
    const params = useParams()
    const postId = Number(params.postId)
    if (Number.isNaN(postId)) return redirect("/posts")
    const result = useQuery(() => postQueryOpts(postId))

    return (
        <Switch>
            <Match when={result.data}>
                <Title>{result.data!.title}</Title>
                <div class={styles.container}>
                    <PostId post={result.data!} />
                    {props.children}
                </div>
            </Match>
            <Match when={result.data === null}>
                <HttpStatusCode code={404} />
                <NotFound />
            </Match>
        </Switch>
    )
}