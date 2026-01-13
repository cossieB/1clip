import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PlatformForm } from '~/features/platforms/components/PlatformForm'
import { platformQueryOpts } from '~/features/platforms/utils/platformQueryOpts'

export const Route = createFileRoute('/admin/platforms/$platformId/edit')({
    component: RouteComponent,
    loader: async ({ context, params }) => {
        await context.queryClient.ensureQueryData(platformQueryOpts(params.platformId))
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => platformQueryOpts(params().platformId))
    
    return (
        <Suspense>
            <PlatformForm platform={result.data} />
        </Suspense>
    )
}
