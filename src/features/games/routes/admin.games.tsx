import { createSignal, createMemo, Errored, Loading } from "solid-js"
import { GamesDataGrid } from "../components/GamesDataGrid"
import { getGamesAdminFn } from "../gamesApi"
import { AwaitedReturn } from "~/lib/utilityTypes"

const LIMIT = 1000

export function AdminGamesRoute() {
    const [cursor, setCursor] = createSignal<number>()
    const [hasMore, setHasMore] = createSignal(true)
    const games = createMemo(async (prev: AwaitedReturn<typeof getGamesAdminFn> = []) => {
        const next = await getGamesAdminFn({ cursor: cursor(), limit: LIMIT });
        if (next.length < LIMIT) setHasMore(false);
        return [...prev, ...next]
    })

    return (
        <Errored fallback={(err) => <p>{(err() as Error).message}</p>}>
            <Loading fallback={<p>Loading games…</p>}>
                <GamesDataGrid
                    games={games()}
                    hasMore={hasMore()}
                    onLoadMore={() => setCursor(games().at(-1)?.gameId)}
                />
            </Loading>
        </Errored>
    )
}