import { Title } from "@solidjs/meta"
import { useQueryClient, useQuery } from "@tanstack/solid-query"
import { createEffect, Suspense, For } from "solid-js"
import { LogoLink } from "~/components/LogoLink/LogoLink"
import { platformsQueryOpts, platformQueryOpts } from "~/features/platforms/utils/platformQueryOpts"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function PlatformsRoute() {
    const queryClient = useQueryClient()
    const result = useQuery(() => platformsQueryOpts())

    createEffect(() => {
        if (result.data) {
            for (const item of result.data) {
                queryClient.setQueryData(platformQueryOpts(item.platformId).queryKey, item)
            }
        }
    })
    
    return (
        <div class={"grid300"}>
            <Title>Platforms</Title>
            <Suspense>
                <For each={result.data}>
                    {dev =>
                        <LogoLink
                            href='platform'
                            item={{
                                id: dev.platformId,
                                logo: STORAGE_DOMAIN + dev.logo,
                                name: dev.name
                            }}
                        />
                    }
                </For>
            </Suspense>
        </div>        
    )
}