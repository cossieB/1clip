import { createMemo, Loading, Show } from "solid-js";
import { getGameFn } from "../gamesApi";
import { useParams } from "@solidjs/router";
import { paths } from "~/router";
import { GameForm } from "../components/GameForm";
import NotFound from "~/routes/[...404]";
import { Spinner } from "~/components/Loader/Spinner";
import { respond } from "@solidjs/web";
import { GET } from "@solidjs/web/server-functions";

// wrapper to override Cache-Control header
const q = GET(async (id: number) => {
    'use server'
    const game = await getGameFn(id)
    return respond(game, {
        headers: {
            "Cache-Control": "no-cache",
            ...(game && {
                "Last-Modified": (game.dateModified ?? game.dateAdded).toUTCString()
            })            
        }
    })
})

export function AdminGameRoute() {
    const params = useParams(paths.admin.games)
    const game = createMemo(() => q(parseInt(params.gameId)))

    return (
        <Loading fallback={<Spinner />}>
            <Show when={game()} fallback={<NotFound />}>
                {game => <GameForm game={game()} />}
            </Show>
        </Loading>
    )
}