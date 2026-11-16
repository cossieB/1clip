import { createMemo, Loading, Show } from "solid-js";
import { getGameFn } from "../gamesApi";
import { useParams } from "@solidjs/router";
import { paths } from "~/router";
import { GameForm } from "../components/GameForm";
import NotFound from "~/routes/[...404]";

export function AdminGameRoute() {
    const params = useParams(paths.admin.games)
    const game = createMemo(() => getGameFn(parseInt(params.gameId)))

    return (
        <Loading>
            <Show when={game()} fallback={<NotFound />}>
                {game => <GameForm game={game()} />}
            </Show>
        </Loading>
    )
}