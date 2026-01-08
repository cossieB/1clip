import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { DevForm } from '~/features/developers/components/DevForm'
import { developerQueryOpts } from '~/features/developers/utils/developerQueryOpts'

export const Route = createFileRoute('/developers/$developerId/edit')({
    component: RouteComponent,
    loader: async ({ context, params }) => {
        await context.queryClient.ensureQueryData(developerQueryOpts(params.developerId))
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => developerQueryOpts(params().developerId))
    return (
        <Suspense>
            <DevForm developer={result.data} />
        </Suspense>
    )
}
