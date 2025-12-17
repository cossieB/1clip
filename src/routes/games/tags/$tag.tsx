import { createFileRoute } from '@tanstack/solid-router'
import { GamesList } from '~/components/GamesList'
import { getGamesByTagFn } from '~/services/gamesService'

export const Route = createFileRoute('/games/tags/$tag')({
    component: RouteComponent,
    loader: async ({ context, params: { tag } }) => {
        return context.queryClient.ensureQueryData({
            queryKey: ["games", "tag", tag],
            queryFn: () => getGamesByTagFn({ data: tag })
        })
    }
})

function RouteComponent() {
    const params = Route.useParams()

    return (
        <GamesList
            query={() => ({
                queryKey: ["games", "tag", params().tag],
                queryFn: () => getGamesByTagFn({ data: params().tag })
            })}
        />
    )
}
