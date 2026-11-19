import { createMemo, Loading, refresh, Show } from "solid-js";
import { getCompanyFn } from "../companiesApi";
import { query, useParams } from "@solidjs/router";
import { paths } from "~/router";
import NotFound from "~/routes/[...404]";
import { Spinner } from "~/components/Loader/Spinner";
import { CompanyForm } from "../components/CompanyForm";
import { respond } from "@solidjs/web";
import { GET } from "@solidjs/web/server-functions";

// wrapper to override Cache-Control header
const q = GET(async (id: number) => {
    'use server'
    const company = await getCompanyFn(id)
    return respond(company, {
        headers: {
            "Cache-Control": "no-cache",
            ...(company && {
                "Last-Modified": (company.dateModified ?? company.dateAdded).toUTCString()
            })            
        }
    })
})

export function AdminCompanyRoute() {
    const params = useParams(paths.admin.companies)
    const c = createMemo(() => q(parseInt(params.companyId)))

    return (
        <Loading fallback={<Spinner />}>
            <Show when={c()} fallback={<NotFound />}>
                {company => <CompanyForm company={company()} />}
            </Show>
        </Loading>
    )
}