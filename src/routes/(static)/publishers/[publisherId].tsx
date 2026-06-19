import { Meta, Title } from "@solidjs/meta"
import { useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { Suspense } from "solid-js"
import { CompanyPage } from "~/components/CompanyPage/CompanyPage"
import { GamesList } from "~/features/games/components/GamesList"
import { publisherQueryOpts } from "~/features/publishers/utils/publisherQueryOpts"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function PublisherIdPage() {

    const params = useParams()
    const devResult = useQuery(() => publisherQueryOpts(Number(params.publisherId)!))

    return (
        <>
            <Suspense>
                <Title> {devResult.data!.name} </Title>     
                <Meta name="og:image" content={STORAGE_DOMAIN + devResult.data?.logo} />
                <CompanyPage
                    id={devResult.data!.publisherId}
                    logo={STORAGE_DOMAIN + devResult.data!.logo}
                    name={devResult.data!.name}
                    summary={devResult.data!.summary}
                    type='publisher'
                />
            </Suspense>
            <GamesList
                filters={{publisherId: Number(params.publisherId)}}
            />
        </>
    )    
}