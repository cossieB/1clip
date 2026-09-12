import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link } from '@tanstack/solid-router'
import { ICellRendererParams } from 'ag-grid-community'
import { Suspense } from 'solid-js'
import { GridWrapper } from '~/components/AdminTable/GridWrapper'
import { platformsQueryOpts } from '~/features/platforms/utils/platformQueryOpts'

export const Route = createFileRoute('/admin/platforms/')({
    component: RouteComponent,  
})

function RouteComponent() {
    const result = useQuery(() => platformsQueryOpts())
    return (
        <Suspense>
            <GridWrapper
                rowData={result.data}
                columnDefs={[{
                    field: "name"
                }, {
                    field: 'dateAdded'
                }, {
                    field: 'dateModified'
                }, {
                    cellRenderer: (props: ICellRendererParams) => <Link to='/admin/platforms/$platformId/edit' params={{ platformId: props.data.platformId }} >Edit</Link>
                }]}
            />
        </Suspense>
    )
}
