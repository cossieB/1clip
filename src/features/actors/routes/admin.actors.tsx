import { createMemo, createSignal, Loading } from "solid-js";
import { AwaitedReturn } from "~/lib/utilityTypes";
import { getActorsAdminFn } from "../actorsApi";
import { ActorsDataGrid } from "../components/ActorsDataGrid";

const LIMIT = 1000

export function AdminActorsRoute() {
    const [offset, setOffset] = createSignal(0)
    const [hasMore, setHasMore] = createSignal(true)
    const actors = createMemo(async (prev: AwaitedReturn<typeof getActorsAdminFn> = []) => {
        const next = await getActorsAdminFn({ limit: LIMIT, offset: offset() });
        if (next.length < LIMIT) setHasMore(false)
        return [...prev, ...next]
    })
    return (
        <Loading >
            <ActorsDataGrid
                rows={actors()}
                onLoadMore={() => setOffset(actors.length)}
                hasMore={hasMore()}
            />
        </Loading>
    )
}