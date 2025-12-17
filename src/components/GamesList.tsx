import { useQuery, useQueryClient } from "@tanstack/solid-query"
import { createEffect } from "solid-js"
import type { getGamesFn } from "~/services/gamesService"
import { PhotoCardGrid } from "./CardLink/PhotoCardLink"

type Opts = {
    queryKey: readonly ["games", ...(string | number)[]],
    queryFn: () => ReturnType<typeof getGamesFn>
}

export function GamesList(props: {query: () => Opts}) {
    const queryClient = useQueryClient()
    const result = useQuery(props.query)

    createEffect(() => {
        if (result.data)
            for (const game of result.data) {
                queryClient.setQueryData(["games", game.gameId], game)
                queryClient.setQueryData(["developers", game.developer.developerId], game.developer)
                queryClient.setQueryData(["publishers", game.publisher.publisherId], game.publisher)
                queryClient.setQueryData(["publishers", game.publisher.publisherId], game.publisher)
            }
    })

    return <PhotoCardGrid
        arr={result.data!}
        getLabel={game => game.title}
        getPic={game => game.cover}
        getParam={game => ({
            gameId: game.gameId
        })}
        to='/games/$gameId'
    />
}