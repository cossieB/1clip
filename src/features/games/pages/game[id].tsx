import { getGameFn } from "../gamesApi";
import { createMemo, Loading, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { paths } from "~/router";
import NotFound from "~/routes/[...404]";
import { GamePage } from "../components/GamePage";
import { SiteTitle } from "~/components/CustomSiteTitle";
import { httpHeader } from "@solidjs/web";
import { Meta } from "@solidjs/meta";
import { mediaSrc } from "~/utils/mediaSrc";

export function GameIdRoute() {
    const params = useParams(paths.games)
    const game = createMemo(() => {
        const gameId = Number(params.gameId)
        if (!gameId) return null
        return getGameFn(gameId)
    }, { deferStream: true })
    return (
        <Loading>
            <Show when={game()} fallback={<NotFound message="These aren't the games you're looking for" />}>
                {game => (
                    <>
                        {httpHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400")}
                        {httpHeader("Last-Modified", (game().dateModified ?? game().dateAdded).toUTCString())}
                        <Meta property="og:title" content={game().title} />
                        <Meta property="og:image" content={mediaSrc(game().banner)} />
                        <Meta property="og:url" content={`https://1clip.cossie.dev/games/${game().gameId}`} />
                        <Meta property="og:description" content={`1Clip info page for ${game().title}`} />
                        <Meta property="og:image:alt" content={`${game().title} banner`} />
                        <SiteTitle> {game().title} </SiteTitle>
                        <GamePage game={game()} />
                    </>
                )}
            </Show>
        </Loading>
    )
}

