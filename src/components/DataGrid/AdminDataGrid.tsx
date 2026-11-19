import { For, Show } from "solid-js"
import styles from "./AdminDataGrid.module.css"
import { JSX } from "@solidjs/web/jsx-runtime"

export type Column<T> = {
    header: string
    cell: (row: T) => JSX.Element
    /** "num" right-pads digits with tabular figures, "title" is the emphasised, truncated name cell */
    kind?: "num" | "title"
}

type AdminDataGridProps<T> = {
    /** Accessible table caption, e.g. "Companies" */
    caption: string
    /** Plural noun for the row count, e.g. "companies" */
    noun: string
    rows: T[]
    columns: Column<T>[]
    editHref: (row: T) => string
    editLabel: (row: T) => string
    /** Show the "Load more" button. Pass `rows.length >= limit` from the parent. */
    hasMore?: boolean
    loadingMore?: boolean
    onLoadMore?: () => void
}

export function AdminDataGrid<T>(props: AdminDataGridProps<T>) {
    return (
        <section class={styles.grid}>
            <div class={styles.scroll}>
                <table class={styles.table}>
                    <caption class={styles.srOnly}>{props.caption}</caption>
                    <thead>
                        <tr>
                            <For each={props.columns}>
                                {(col) => (
                                    <th scope="col" class={col.kind === "num" ? styles.num : undefined}>
                                        {col.header}
                                    </th>
                                )}
                            </For>
                            <th scope="col" class={styles.actions}>
                                <span class={styles.srOnly}>Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <For
                            each={props.rows}
                            fallback={
                                <tr>
                                    <td colspan={props.columns.length + 1} class={styles.empty}>
                                        No {props.noun} found. Adjust the filters or add one.
                                    </td>
                                </tr>
                            }
                        >
                            {(row) => (
                                <tr>
                                    <For each={props.columns}>
                                        {(col) => (
                                            <td class={col.kind ? styles[col.kind!] : undefined}>
                                                {col.cell(row)}
                                            </td>
                                        )}
                                    </For>
                                    <td class={styles.actions}>
                                        <a
                                            class={["button", "secondary", styles.edit]}
                                            href={props.editHref(row)}
                                            aria-label={props.editLabel(row)}
                                        >
                                            Edit
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
            </div>

            <footer class={styles.footer}>
                <p aria-live="polite">{props.rows.length} {props.noun} loaded</p>
                <Show when={props.hasMore}>
                    <button
                        type="button"
                        class="secondary"
                        disabled={props.loadingMore}
                        onClick={() => props.onLoadMore?.()}
                    >
                        {props.loadingMore ? "Loading…" : "Load more"}
                    </button>
                </Show>
            </footer>
        </section>
    )
}
