import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute, Link, notFound } from '@tanstack/solid-router'
import { createEffect, Suspense } from 'solid-js'
import { NotFound } from '~/components/NotFound/NotFound'
import { developerQueryOpts } from '~/features/developers/utils/developerQueryOpts'
import { GamePage } from '~/features/games/components/GamePage'
import { gameQueryOpts } from '~/features/games/utils/gameQueryOpts'
import { platformQueryOpts } from '~/features/platforms/utils/platformQueryOpts'
import { publisherQueryOpts } from '~/features/publishers/utils/publisherQueryOpts'

export const Route = createFileRoute('/admin/games/$gameId/')({
    component: RouteComponent,

    loader: async ({ context, params: { gameId } }) => {
        if (Number.isNaN(gameId)) throw notFound()
        return await context.queryClient.ensureQueryData(gameQueryOpts(gameId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.title + " :: 1Clip" }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Games You're Looking For" />
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const params = Route.useParams()
    
    const result = useQuery(() => gameQueryOpts(params().gameId))

    createEffect(() => {
        if (result.data) {
            queryClient.setQueryData(developerQueryOpts(result.data.developer.developerId).queryKey, result.data.developer)
            queryClient.setQueryData(publisherQueryOpts(result.data.publisher.publisherId).queryKey, result.data.publisher)

            result.data.platforms.forEach(plat => {
                queryClient.setQueryData(platformQueryOpts(plat.platformId).queryKey, plat)
            })
        }
    })
  
    return (
        <Suspense>
            <GamePage game={result.data!} />
        </Suspense>
    )
}