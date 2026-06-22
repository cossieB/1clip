import { Meta } from "@solidjs/meta"
import { useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { Show, Suspense } from "solid-js"
import { CompanyPage } from "~/components/CompanyPage/CompanyPage"
import { MySiteTitle } from "~/components/MySiteTitle"
import { developerQueryOpts } from "~/features/developers/utils/developerQueryOpts"
import { GamesList } from "~/features/games/components/GamesList"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function DeveloperIdPage() {

    const params = useParams()
    const result = useQuery(() => developerQueryOpts(Number(params.developerId)!))

    return (
        <>
            <Show when={result.data}>
                <MySiteTitle> {result.data!.name} </MySiteTitle>
                <Meta name="og:image" content={STORAGE_DOMAIN + result.data?.logo} />                
                <CompanyPage
                    id={result.data!.developerId}
                    logo={STORAGE_DOMAIN + result.data!.logo}
                    name={result.data!.name}
                    summary={result.data!.summary}
                    type='developer'
                />
            </Show>
            <GamesList
                filters={{developerId: Number(params.developerId)}}
            />
        </>
    )    
}