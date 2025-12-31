import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { Carousel } from '~/components/Carousel'
import { getPostFn } from '~/serverFn/posts'

export const Route = createFileRoute('/posts/$postId')({
    params: {
        parse: params => ({
            postId: Number(params.postId)
        })
    },
    loader: async ({ context, params: { postId }, }) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["posts", postId],
            queryFn: () => getPostFn({ data: postId })
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => ({
        queryKey: ["posts", params().postId],
        queryFn: () => getPostFn({ data: params().postId })
    }))
    return (
        <Suspense>
            <div>
                <h1> {result.data!.title} </h1>
                <div innerHTML={result.data!.text} />
                <Carousel
                    media={result.data!.media.map(m => ({
                        url: import.meta.env.VITE_STORAGE_DOMAIN + m.key,
                        contentType: m.contentType
                    }))}
                    showNextBtn
                    showPrevBtn
                />
            </div>
        </Suspense>
    )
}
