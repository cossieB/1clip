import { useQueryClient, useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, Suspense, Switch, Match } from 'solid-js'
import { GamesList } from '~/components/GamesList/GamesList'
import { getGamesFn } from '~/services/gamesService'

export const Route = createFileRoute('/games/')({
    component: RouteComponent,
    loader: async ({context}) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["games"],
            queryFn: () => getGamesFn()
        })
    } 
})

function RouteComponent() {
    // const gamesFetcher = useServerFn(getGames)
    const queryClient = useQueryClient()
    const result = useQuery(() => ({
        queryKey: ["games"],
        queryFn: () => getGamesFn(),

    }))

    createEffect(() => {
        
        if (result.data)
            for (const game of result.data) {
                queryClient.setQueryData(["game", game.gameId], game)
                queryClient.setQueryData(["developer", game.developer.developerId], game.developer)
                queryClient.setQueryData(["publisher", game.publisher.publisherId], game.publisher)
                queryClient.setQueryData(["publisher", game.publisher.publisherId], game.publisher)
            }
    })

    return (
        <Suspense>
            <Switch>
                <Match when={result.data}>
                    <GamesList games={result.data!} />
                </Match>
                <Match when={result.isLoading}>
                    <span>TODO: make loading spinner</span>
                </Match>
            </Switch>
        </Suspense>
    )
}
