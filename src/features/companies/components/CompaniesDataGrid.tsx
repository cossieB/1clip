import { AdminDataGrid, Column } from "~/components/DataGrid/AdminDataGrid"
import { getCompaniesAdminFn } from "../companiesApi"
import { EntityGridProps, isoDate } from "~/components/DataGrid/EntityDataGrids"

type CompanyRow = Awaited<ReturnType<typeof getCompaniesAdminFn>>[number]

const companyColumns: Column<CompanyRow>[] = [
    { header: "ID", kind: "num", cell: (c) => c.companyId },
    { header: "Name", kind: "title", cell: (c) => c.name },
    { header: "Headquarters", cell: (c) => c.headquarters ?? "—" },
    { header: "Country", cell: (c) => c.country ?? "—" },
    { header: "Added", kind: "num", cell: (c) => isoDate(c.dateAdded) },
]

export function CompaniesDataGrid(props: EntityGridProps<CompanyRow>) {
    return (
        <AdminDataGrid
            caption="Companies"
            noun="companies"
            rows={props.rows}
            columns={companyColumns}
            editHref={(c) => `/admin/companies/${c.companyId}`}
            editLabel={(c) => `Edit ${c.name}`}
            hasMore={props.hasMore}
            loadingMore={props.loadingMore}
            onLoadMore={props.onLoadMore}
        />
    )
}
