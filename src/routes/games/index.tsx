import { createFileRoute } from '@tanstack/solid-router'
import { GamesList } from '~/components/GamesList'
import { getGamesFn } from '~/services/gamesService'

export const Route = createFileRoute('/games/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["games"],
            queryFn: () => getGamesFn()
        })
    },
    head: () => ({
        meta: [{ title: "Games :: GG" }],
    }),
})

function RouteComponent() {

    return (
        <GamesList
            query={() => ({
        queryKey: ["games"],
        queryFn: () => getGamesFn(),
    })}
        />
    )
}
