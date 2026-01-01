import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, Suspense } from 'solid-js'
import { PostList } from '~/components/Posts/PostList'
import { usePostCache } from '~/hooks/usePostCache'
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

    usePostCache(result)
    
    return (
        <Suspense>
            <PostList posts={result.data!} />
        </Suspense>
    )
}