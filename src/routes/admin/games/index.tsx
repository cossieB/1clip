import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link } from '@tanstack/solid-router'
import { ICellRendererParams } from 'ag-grid-community'
import { Suspense } from 'solid-js'
import { GridWrapper } from '~/components/AdminTable/GridWrapper'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/admin/games/')({
    component: RouteComponent,
})

function RouteComponent() {
    const result = useQuery(() => gamesQueryOpts())
    return (
        <Suspense>
            <GridWrapper
                rowData={result.data}
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
                    field: "trailer"
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
