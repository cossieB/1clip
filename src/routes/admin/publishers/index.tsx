import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link } from '@tanstack/solid-router'
import { ICellRendererParams } from 'ag-grid-community'
import { Suspense } from 'solid-js'
import { GridWrapper } from '~/components/AdminTable/GridWrapper'
import { publishersQueryOpts } from '~/features/publishers/utils/publisherQueryOpts'

export const Route = createFileRoute('/admin/publishers/')({
  component: RouteComponent,
})

function RouteComponent() {
  const result = useQuery(() => publishersQueryOpts())
    return (
        <Suspense>
            <GridWrapper
                rowData={result.data}
                columnDefs={[{
                    field: "name"
                }, {
                    field: "headquarters"
                }, {
                    field: "country"
                }, {
                    field: 'dateAdded'
                }, {
                    field: 'dateModified'
                }, {
                    cellRenderer: (props: ICellRendererParams) => <Link to='/admin/publishers/$publisherId/edit' params={{ publisherId: props.data.publisherId }} >Edit</Link>
                }]}
            />
        </Suspense>
    )
}
