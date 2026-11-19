import { AdminDataGrid, type Column } from "~/components/DataGrid/AdminDataGrid"
import { getGamesAdminFn } from "../gamesApi"

export type GameRow = Awaited<ReturnType<typeof getGamesAdminFn>>[number]

type GamesDataGridProps = {
    games: GameRow[]
    hasMore?: boolean
    loadingMore?: boolean
    onLoadMore?: () => void
}

const gameColumns: Column<GameRow>[] = [
    { header: "ID", kind: "num", cell: (g) => g.gameId },
    { header: "Title", kind: "title", cell: (g) => g.title },
    { header: "Release date", kind: "num", cell: (g) => g.releaseDate },
    { header: "Developer ID", kind: "num", cell: (g) => g.developerId },
    { header: "Publisher ID", kind: "num", cell: (g) => g.publisherId },
]

export function GamesDataGrid(props: GamesDataGridProps) {
    return (
        <AdminDataGrid
            caption="Games"
            noun="games"
            rows={props.games}
            columns={gameColumns}
            editHref={(g) => `/admin/games/${g.gameId}`}
            editLabel={(g) => `Edit ${g.title}`}
            hasMore={props.hasMore}
            loadingMore={props.loadingMore}
            onLoadMore={props.onLoadMore}
        />
    )
}