import { useQueryClient, useQuery } from "@tanstack/solid-query"
import { createEffect, Suspense, For } from "solid-js"
import { LogoLink } from "~/components/LogoLink/LogoLink"
import { MySiteTitle } from "~/components/MySiteTitle"
import { publishersQueryOpts, publisherQueryOpts } from "~/features/publishers/utils/publisherQueryOpts"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function PublishersRoute() {
    const queryClient = useQueryClient()
    const result = useQuery(() => publishersQueryOpts())

    createEffect(() => {
        if (result.data) {
            for (const item of result.data) {
                queryClient.setQueryData(publisherQueryOpts(item.publisherId).queryKey, item)
            }
        }
    })
    
    return (
        <div class={"grid300"}>
            <MySiteTitle>Publishers</MySiteTitle>
            <Suspense>
                <For each={result.data}>
                    {dev =>
                        <LogoLink
                            href='publisher'
                            item={{
                                id: dev.publisherId,
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