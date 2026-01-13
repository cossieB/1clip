import type { GridApi, GridOptions, Module } from "ag-grid-community";
import AgGridSolid, { AgGridSolidRef } from "solid-ag-grid";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ClientOnly } from "@tanstack/solid-router";

interface AgGridSolidProps<TData> extends GridOptions<TData> {
    gridOptions?: GridOptions<TData>;
    ref?: AgGridSolidRef | ((ref: AgGridSolidRef) => void);
    modules?: Module[];
    class?: string;
}

export function GridWrapper<TData = any>(props: AgGridSolidProps<TData>) {


    return (
        <div style={{ height: "100%" }} class="ag-theme-alpine-dark">
            <ClientOnly>
            <AgGridSolid {...props} />
            </ClientOnly>
        </div>
    )
}