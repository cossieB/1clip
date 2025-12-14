import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { GamePage } from '~/components/GamePage/GamePage'
import { NotFound } from '~/components/NotFound'
import { getGameFn } from '~/services/gamesService'

export const Route = createFileRoute('/games/$gameId')({
    component: RouteComponent,
    params: {
        parse: params => ({
            gameId: Number(params.gameId)
        })
    },
    loader: async ({ context, params: { gameId } }) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["games", gameId],
            queryFn: () => getGameFn({ data: gameId })
        })
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.title }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Games You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => ({
        queryKey: ["games", params().gameId],
        queryFn: () => getGameFn({ data: params().gameId })
    }))

    return (
        <Suspense>
            <GamePage game={result.data!} />
        </Suspense>
    )
}

