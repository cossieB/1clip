import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { For, Suspense } from 'solid-js';
import { PostBlock } from '~/features/posts/components/PostBlock';
import { searchPostsFn } from '~/serverFn/posts';

export const Route = createFileRoute('/_pub/search/posts')({
    component: RouteComponent,
})

function RouteComponent() {
    const searhParams = Route.useSearch()
    //@ts-expect-error    
    const s = () => searhParams()?.s as string | undefined

    const result = useQuery(() => ({
        enabled: () => !!s(),
        queryFn: () => searchPostsFn({data: s() ?? ""}),
        queryKey: ["posts", "search", s()]
    }))

    return (
        <Suspense >
            <For each={result.data}>
                {post => <PostBlock post={post} />}
            </For>
        </Suspense>
    )
}
