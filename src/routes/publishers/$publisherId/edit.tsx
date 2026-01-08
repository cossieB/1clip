import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PubForm } from '~/features/publishers/components/PubForm'
import { publisherQueryOpts } from '~/features/publishers/utils/publisherQueryOpts'

export const Route = createFileRoute('/publishers/$publisherId/edit')({
    component: RouteComponent,
    loader: async ({ context, params }) => {
        await context.queryClient.ensureQueryData(publisherQueryOpts(params.publisherId))
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => publisherQueryOpts(params().publisherId))

    return (
        <Suspense>
            <PubForm publisher={result.data} />
        </Suspense>
    )
}
