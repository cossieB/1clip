import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { actorsQueryOpts } from '~/features/actors/utils/actorQueryOpts'
import { GridWrapper } from '~/components/AdminTable/GridWrapper';
import { ICellRendererParams } from 'ag-grid-community';

export const Route = createFileRoute('/admin/actors/')({
    component: RouteComponent,
})

function RouteComponent() {
    const result = useQuery(() => actorsQueryOpts())

    return (
        <Suspense >
            <GridWrapper
                rowData={result.data}
                columnDefs={[{
                    field: "name"
                }, {
                    field: 'dateAdded'
                }, {
                    field: 'dateModified'
                }, {
                    cellRenderer: (props: ICellRendererParams) => <Link to='/admin/actors/$actorId/edit' params={{ actorId: props.data.actorId }} >Edit</Link>
                }]}
            />
        </Suspense>
    )
}

