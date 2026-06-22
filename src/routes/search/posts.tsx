import { useSearchParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { Suspense, For } from "solid-js"
import { MySiteTitle } from "~/components/MySiteTitle"
import { PostBlock } from "~/features/posts/components/PostBlock"
import { searchPostsFn } from "~/services/postService"

export default function SearchPostsRoute() {
    const [search, setSearch] = useSearchParams()
    const s = () => Array.isArray(search.s ) ? search.s[0] : search.s

    const result = useQuery(() => ({
        enabled: () => !!s(),
        queryFn: () => searchPostsFn(s() ?? "" ),
        queryKey: ["posts", "search", s()]
    }))

    return (
        <Suspense >
            <MySiteTitle>Search Posts: {s()} </MySiteTitle>
            <For each={result.data}>
                {post => <PostBlock post={post} />}
            </For>
        </Suspense>
    )
}