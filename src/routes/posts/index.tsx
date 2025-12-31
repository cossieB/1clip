import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { For, Suspense } from 'solid-js'
import { PostBlock } from '~/components/Posts/Post'
import { getAllPostsFn } from '~/serverFn/posts'

export const Route = createFileRoute('/posts/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        return context.queryClient.ensureQueryData({
            queryKey: ["posts"],
            queryFn: () => getAllPostsFn()
        })
    }
})

function RouteComponent() {
    const result = useQuery(() => ({
        queryKey: ["posts"],
        queryFn: () => getAllPostsFn()
    }))
    
    return (
        <Suspense>
            <For each={result.data}>
                {post => <PostBlock post={post} />}
            </For>
        </Suspense>
    )
}

