import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, Suspense } from 'solid-js'
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
    const queryClient = useQueryClient()
    const params = Route.useParams()
    const result = useQuery(() => ({
        queryKey: ["games", params().gameId],
        queryFn: () => getGameFn({ data: params().gameId })
    }))

    createEffect(() => {
        if (result?.data) {
            queryClient.setQueryData(["developers", result.data.developer.developerId], result.data.developer)
            queryClient.setQueryData(["publishers", result.data.publisher.publisherId], result.data.publisher)
        }
    })

    return (
        <Suspense>
            <GamePage game={result.data!} />
        </Suspense>
    )
}