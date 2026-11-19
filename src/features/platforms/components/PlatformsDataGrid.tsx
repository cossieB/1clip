import { AdminDataGrid, Column } from "~/components/DataGrid/AdminDataGrid"
import { getPlatformsAdminFn } from "../platformsApi"
import { EntityGridProps, isoDate } from "~/components/DataGrid/EntityDataGrids"

type PlatformRow = Awaited<ReturnType<typeof getPlatformsAdminFn>>[number]

const platformColumns: Column<PlatformRow>[] = [
    { header: "ID", kind: "num", cell: (p) => p.platformId },
    { header: "Name", kind: "title", cell: (p) => p.name },
    { header: "Release date", kind: "num", cell: (p) => p.releaseDate },
    { header: "Added", kind: "num", cell: (p) => isoDate(p.dateAdded) },
]

export function PlatformsDataGrid(props: EntityGridProps<PlatformRow>) {
    return (
        <AdminDataGrid
            caption="Platforms"
            noun="platforms"
            rows={props.rows}
            columns={platformColumns}
            editHref={(p) => `/admin/platforms/${p.platformId}`}
            editLabel={(p) => `Edit ${p.name}`}
            hasMore={props.hasMore}
            loadingMore={props.loadingMore}
            onLoadMore={props.onLoadMore}
        />
    )
}