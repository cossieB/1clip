import { createMemo, createSignal, Loading } from "solid-js";
import { AwaitedReturn } from "~/lib/utilityTypes";
import { getCompaniesAdminFn } from "../companiesApi";
import { CompaniesDataGrid } from "../components/CompaniesDataGrid";

const LIMIT = 1000

export function AdminCompaniesRoute() {
    const [offset, setOffset] = createSignal(0)
    const [hasMore, setHasMore] = createSignal(true)
    const companies = createMemo(async (prev: AwaitedReturn<typeof getCompaniesAdminFn> = []) => {
        const next = await getCompaniesAdminFn({ limit: LIMIT, offset: offset() });
        if (next.length < LIMIT) setHasMore(false)
        return [...prev, ...next]
    })
    return (
        <Loading >
            <CompaniesDataGrid
                rows={companies()}
                onLoadMore={() => setOffset(companies.length)}
                hasMore={hasMore()}
            />
        </Loading>
    )
}