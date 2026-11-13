import { getGameFn } from "../gamesApi";
import { createMemo, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { paths } from "~/router";
import NotFound from "~/routes/[...404]";
import { GamePage } from "../components/GamePage";
import { SiteTitle } from "~/components/CustomSiteTitle";

export function GameIdPage() {
    const params = useParams(paths.games)
    const game = createMemo(() => {
        const gameId = Number(params.gameId)
        if (!gameId) return null
        return getGameFn(gameId)
    })

    return (
        <Show when={game()} fallback={<NotFound message="These aren't the games you're looking for" />}>
            {game => (
                <>
                    <SiteTitle> {game().title} </SiteTitle>
                    <GamePage game={game()} />
                </>
            )}
        </Show>
    )
}

