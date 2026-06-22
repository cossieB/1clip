import { Meta } from "@solidjs/meta"
import { useParams } from "@solidjs/router"
import { useQuery, useQueryClient } from "@tanstack/solid-query"
import { createEffect, Match, Switch } from "solid-js"
import { MySiteTitle } from "~/components/MySiteTitle"
import { developerQueryOpts } from "~/features/developers/utils/developerQueryOpts"
import { GamePage } from "~/features/games/components/GamePage"
import { gameQueryOpts } from "~/features/games/utils/gameQueryOpts"
import { platformQueryOpts } from "~/features/platforms/utils/platformQueryOpts"
import { publisherQueryOpts } from "~/features/publishers/utils/publisherQueryOpts"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function GameIdRoute() {
    const queryClient = useQueryClient()
    const params = useParams()
    
    const result = useQuery(() => gameQueryOpts(Number(params.gameId)))

    createEffect(() => {
        if (result.data) {
            queryClient.setQueryData(developerQueryOpts(result.data.developer.developerId).queryKey, result.data.developer)
            queryClient.setQueryData(publisherQueryOpts(result.data.publisher.publisherId).queryKey, result.data.publisher)

            result.data.platforms.forEach(plat => {
                queryClient.setQueryData(platformQueryOpts(plat.platformId).queryKey, plat)
            })
        }
    })
  
    return (
        <Switch>
            <Match when={result.data}>
                <Meta name="og:image" content={STORAGE_DOMAIN + result.data!.banner} />
                <MySiteTitle> {result.data!.title} </MySiteTitle>
                <GamePage game={result.data!} />
            </Match>
            <Match when={result.error}>
                {result.error?.message}
            </Match>            
        </Switch>
    )
}