import { PhotoCardGrid } from "../../../components/CardLink/PhotoCardLink"
import { useGamesQuery } from "~/features/games/hooks/useGameQuery"
import { STORAGE_DOMAIN } from "~/utils/env"
import { GameQueryFilters } from "~/repositories/gamesRepository"


export function GamesList(props: {filters: GameQueryFilters}) {
    const result = useGamesQuery(props.filters)

    return <PhotoCardGrid
        arr={result.data!}
        getLabel={game => game.title}
        getPic={game => STORAGE_DOMAIN + game.cover}
        getParam={game => ({
            gameId: game.gameId
        })}
        to='/games/$gameId'
    />
}