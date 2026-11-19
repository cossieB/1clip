import { createMemo, Loading, Show } from "solid-js";
import { getCompanyFn } from "../companiesApi";
import { useParams } from "@solidjs/router";
import { paths } from "~/router";
import NotFound from "~/routes/[...404]";
import { httpHeader } from "@solidjs/web";
import { Meta } from "@solidjs/meta";
import { mediaSrc } from "~/utils/mediaSrc";
import { SiteTitle } from "~/components/CustomSiteTitle";
import { CompanyPage } from "../components/CompanyPage";

export function CompanyIdRoute() {
    const params = useParams(paths.companies)
    const company = createMemo(() => {
        const companyId = Number(params.companyId)
        if (!companyId) return null
        return getCompanyFn(companyId)
    }, { deferStream: true })

    return (
        <Loading>
            <Show when={company()} fallback={<NotFound />}>
                {company => (
                    <>
                        {httpHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=604800")}
                        {httpHeader("Last-Modified", (company().dateModified ?? company().dateAdded).toUTCString())}
                        <Meta property="og:title" content={company().name} />
                        <Meta property="og:image" content={mediaSrc(company().logo)} />
                        <Meta property="og:url" content={`https://1clip.cossie.dev/games/${company().companyId}`} />
                        <Meta property="og:description" content={`1Clip info page for ${company().name}`} />
                        <Meta property="og:image:alt" content={`${company().name} logo`} />
                        <SiteTitle> {company().name} </SiteTitle>
                        <CompanyPage company={company()} />
                    </>
                )}
            </Show>
        </Loading>
    )
}