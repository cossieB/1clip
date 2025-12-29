import { useQuery } from "@tanstack/solid-query"
import type { getGamesFn } from "~/serverFn/games"
import { PhotoCardGrid } from "./CardLink/PhotoCardLink"
import { useGamesCache } from "~/hooks/useGameCache"

type Opts = {
    queryKey: readonly ["games", ...(string | number)[]],
    queryFn: () => ReturnType<typeof getGamesFn>
}

export function GamesList(props: {query: () => Opts}) {
    const result = useQuery(props.query)
    
    useGamesCache(result)

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