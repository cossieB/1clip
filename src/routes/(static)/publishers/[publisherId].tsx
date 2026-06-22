import { Meta } from "@solidjs/meta"
import { useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { Show, Suspense } from "solid-js"
import { CompanyPage } from "~/components/CompanyPage/CompanyPage"
import { MySiteTitle } from "~/components/MySiteTitle"
import { GamesList } from "~/features/games/components/GamesList"
import { publisherQueryOpts } from "~/features/publishers/utils/publisherQueryOpts"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function PublisherIdPage() {

    const params = useParams()
    const result = useQuery(() => publisherQueryOpts(Number(params.publisherId)!))

    return (
        <>
            <Show when={result.data}>
                <MySiteTitle> {result.data!.name} </MySiteTitle>     
                <Meta name="og:image" content={STORAGE_DOMAIN + result.data?.logo} />
                <CompanyPage
                    id={result.data!.publisherId}
                    logo={STORAGE_DOMAIN + result.data!.logo}
                    name={result.data!.name}
                    summary={result.data!.summary}
                    type='publisher'
                />
            </Show>
            <GamesList
                filters={{publisherId: Number(params.publisherId)}}
            />
        </>
    )    
}