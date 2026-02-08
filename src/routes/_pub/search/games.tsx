import { useQuery } from '@tanstack/solid-query';
import { createFileRoute, useLocation } from '@tanstack/solid-router'
import { For, Suspense } from 'solid-js';
import { PhotoCardGrid } from '~/components/CardLink/PhotoCardLink';
import { searchGamesFn } from '~/serverFn/games';
import { STORAGE_DOMAIN } from '~/utils/env';

export const Route = createFileRoute('/_pub/search/games')({
    component: RouteComponent,
})

function RouteComponent() {
    const location = useLocation()
    const s = () => location().search.s

    const result = useQuery(() => ({
        enabled: () => !!s(),
        queryFn: () => searchGamesFn({ data: s() ?? "" }),
        queryKey: ["games", "search", s()]
    }))

    return (
        <Suspense>
            <PhotoCardGrid
                arr={result.data ?? []}
                getLabel={game => game.title}
                getPic={game => STORAGE_DOMAIN + game.cover}
                getParam={game => ({ gameId: game.gameId })}
                to='/games/$gameId'
            />
        </Suspense>
    )
}
