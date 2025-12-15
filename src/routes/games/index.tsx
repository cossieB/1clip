import { useQueryClient, useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { createEffect } from 'solid-js'
import { PhotoCardGrid } from '~/components/CardLink/PhotoCardLink'
import { getGamesFn } from '~/services/gamesService'

export const Route = createFileRoute('/games/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["games"],
            queryFn: () => getGamesFn()
        })
    }
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const result = useQuery(() => ({
        queryKey: ["games"],
        queryFn: () => getGamesFn(),

    }))

    createEffect(() => {

        if (result.data)
            for (const game of result.data) {
                queryClient.setQueryData(["games", game.gameId], game)
                queryClient.setQueryData(["developers", game.developer.developerId], game.developer)
                queryClient.setQueryData(["publishers", game.publisher.publisherId], game.publisher)
                queryClient.setQueryData(["publishers", game.publisher.publisherId], game.publisher)
            }
    })

    return (
        <PhotoCardGrid
            arr={result.data!}
            getLabel={game => game.title}
            getPic={game => game.cover}
            getParam={game => ({ gameId: game.gameId })}
            to="/games/$gameId"
        />
    )
}
