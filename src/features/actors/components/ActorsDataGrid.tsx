import { AdminDataGrid, Column } from "~/components/DataGrid/AdminDataGrid";
import { EntityGridProps, isoDate } from "~/components/DataGrid/EntityDataGrids";
import { getActorsAdminFn } from "../actorsApi";

type ActorRow = Awaited<ReturnType<typeof getActorsAdminFn>>[number]

const actorColumns: Column<ActorRow>[] = [
    { header: "ID", kind: "num", cell: (a) => a.actorId },
    { header: "Name", kind: "title", cell: (a) => a.name },
    { header: "Added", kind: "num", cell: (a) => isoDate(a.dateAdded) },
]

export function ActorsDataGrid(props: EntityGridProps<ActorRow>) {
    return (
        <AdminDataGrid
            caption="Actors"
            noun="actors"
            rows={props.rows}
            columns={actorColumns}
            editHref={(a) => `/admin/actors/${a.actorId}`}
            editLabel={(a) => `Edit ${a.name}`}
            hasMore={props.hasMore}
            loadingMore={props.loadingMore}
            onLoadMore={props.onLoadMore}
        />
    )
}
