import { Meta, Title } from "@solidjs/meta"
import { useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { Suspense } from "solid-js"
import { CompanyPage } from "~/components/CompanyPage/CompanyPage"
import { developerQueryOpts } from "~/features/developers/utils/developerQueryOpts"
import { GamesList } from "~/features/games/components/GamesList"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function DeveloperIdPage() {

    const params = useParams()
    const devResult = useQuery(() => developerQueryOpts(Number(params.developerId)!))

    return (
        <>
            <Suspense>
                <Title> {devResult.data!.name} </Title>
                <Meta name="og:image" content={STORAGE_DOMAIN + devResult.data?.logo} />                
                <CompanyPage
                    id={devResult.data!.developerId}
                    logo={STORAGE_DOMAIN + devResult.data!.logo}
                    name={devResult.data!.name}
                    summary={devResult.data!.summary}
                    type='developer'
                />
            </Suspense>
            <GamesList
                filters={{developerId: Number(params.developerId)}}
            />
        </>
    )    
}