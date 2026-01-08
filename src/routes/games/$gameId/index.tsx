import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute, notFound } from '@tanstack/solid-router'
import { createEffect, Suspense } from 'solid-js'
import { NotFound } from '~/components/NotFound/NotFound'
import { GamePage } from '~/features/games/components/GamePage'
import { getGameFn } from '~/serverFn/games'

export const Route = createFileRoute('/games/$gameId/')({
    component: RouteComponent,
    params: {
        parse: params => ({
            gameId: Number(params.gameId)
        })
    },
    loader: async ({ context, params: { gameId } }) => {
        if (Number.isNaN(gameId)) throw notFound()
        return await context.queryClient.ensureQueryData({
            queryKey: ["games", gameId],
            queryFn: () => getGameFn({ data: gameId })
        })
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.title + " :: GG" }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Games You're Looking For" />
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const params = Route.useParams()
    
    const result = useQuery(() => ({
        queryKey: ["games", params().gameId],
        queryFn: () => getGameFn({ data: params().gameId })
    }))

    createEffect(() => {
        if (result.data) {
            queryClient.setQueryData(["developers", result.data.developer.developerId], result.data.developer)
            queryClient.setQueryData(["publishers", result.data.publisher.publisherId], result.data.publisher)

            result.data.platforms.forEach(plat => {
                queryClient.setQueryData(["platforms", plat.platformId], plat)
            })
        }
    })
  
    return (
        <Suspense>
            <GamePage game={result.data!} />
        </Suspense>
    )
}