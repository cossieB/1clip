import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link } from '@tanstack/solid-router'
import { ICellRendererParams } from 'ag-grid-community'
import { Suspense } from 'solid-js'
import { GridWrapper } from '~/components/AdminTable/GridWrapper'
import { developersQueryOpts } from '~/features/developers/utils/developerQueryOpts'

export const Route = createFileRoute('/admin/developers/')({
    component: RouteComponent,
})

function RouteComponent() {
    const result = useQuery(() => developersQueryOpts())

    return (
        <Suspense>
            <GridWrapper
                rowData={result.data}
                columnDefs={[{
                    field: "name"
                }, {
                    field: "location"
                }, {
                    field: "country"
                }, {
                    field: 'dateAdded'
                }, {
                    field: 'dateModified'
                }, {
                    cellRenderer: (props: ICellRendererParams) => <Link to='/admin/developers/$developerId/edit' params={{ developerId: props.data.developerId }} >Edit</Link>
                }]}
            />
        </Suspense>
    )
}
