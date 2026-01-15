import { createFileRoute, Link } from '@tanstack/solid-router'
import { ICellRendererParams } from 'ag-grid-community'
import { Suspense } from 'solid-js'
import { GridWrapper } from '~/components/AdminTable/GridWrapper'
import { useGamesQuery } from '~/features/games/hooks/useGameQuery'
import { gamesWithExtrasQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/admin/games/')({
    component: RouteComponent,
    loader: (async ({ context }) => {
        await context.queryClient.ensureInfiniteQueryData(gamesWithExtrasQueryOpts({limit: 5000}))
    })    
})

function RouteComponent() {

    const result = useGamesQuery({limit: 5000})

    return (
        <Suspense>
            <GridWrapper
                rowData={result.data?.pages[0]}
                columnDefs={[{
                    field: "title",
                }, {
                    field: "developer.name"
                }, {
                    field: "publisher.name"
                }, {
                    field: "releaseDate"
                }, {
                    field: "genres"
                }, {
                    field: "actors",
                    valueFormatter: params => params.data?.actors.map(actor => actor.name).join(", ") ?? ""
                }, {
                    field: "dateModified"
                }, {
                    field: "dateAdded"
                }, {
                    cellRenderer: (param: ICellRendererParams) => <Link to='/admin/games/$gameId/edit' params={{gameId: param.data.gameId}}>Edit</Link>
                }]}
            />
        </Suspense>
    )
}
