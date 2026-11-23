import { createMemo, createSignal, Loading } from "solid-js";
import { PlatformsDataGrid } from "~/features/platforms/components/PlatformsDataGrid";
import { getPlatformsAdminFn } from "~/features/platforms/platformsApi";
import { AwaitedReturn } from "~/lib/utilityTypes";

const LIMIT = 1000

export function AdminPlatformsRoute() {
    const [offset, setOffset] = createSignal(0)
    const [hasMore, setHasMore] = createSignal(true)
    const platforms = createMemo(async (prev: AwaitedReturn<typeof getPlatformsAdminFn> = []) => {
        const next = await getPlatformsAdminFn({ limit: LIMIT, offset: offset() });
        if (next.length < LIMIT) setHasMore(false)
        return [...prev, ...next]
    })
    return (
        <Loading >
            <PlatformsDataGrid
                rows={platforms()}
                onLoadMore={() => setOffset(platforms.length)}
                hasMore={hasMore()}
            />
        </Loading>
    )
}