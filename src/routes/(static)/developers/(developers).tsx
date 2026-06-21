import { Title } from "@solidjs/meta"
import { useQuery, useQueryClient } from "@tanstack/solid-query"
import { createEffect, For, Suspense } from "solid-js"
import { LogoLink } from "~/components/LogoLink/LogoLink"
import { developerQueryOpts, developersQueryOpts } from "~/features/developers/utils/developerQueryOpts"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function DevelopersRoute() {
    const queryClient = useQueryClient()
    const result = useQuery(() => developersQueryOpts())

    createEffect(() => {
        if (result.data) {
            for (const item of result.data) {
                queryClient.setQueryData(developerQueryOpts(item.developerId).queryKey, item)
            }
        }
    })
    
    return (
        <div class={"grid300"}>
            <Title>Developers</Title>
            <Suspense>
                <For each={result.data}>
                    {dev =>
                        <LogoLink
                            href='developer'
                            item={{
                                id: dev.developerId,
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