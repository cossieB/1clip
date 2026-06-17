import type { GridApi, GridOptions, Module } from "ag-grid-community";
import type { AgGridSolidRef } from "solid-ag-grid";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { clientOnly } from "@solidjs/start";

const AgGridSolid = clientOnly(() => import("solid-ag-grid"))

interface AgGridSolidProps<TData> extends GridOptions<TData> {
    gridOptions?: GridOptions<TData>;
    ref?: AgGridSolidRef | ((ref: AgGridSolidRef) => void);
    modules?: Module[];
    class?: string;
}

export function GridWrapper<TData = any>(props: AgGridSolidProps<TData>) {


    return (
        <div style={{ height: "100%" }} class="ag-theme-alpine-dark">
            {/* @ts-expect-error */}
            <AgGridSolid {...props} />
        </div>
    )
}