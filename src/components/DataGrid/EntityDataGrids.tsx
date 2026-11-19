export type EntityGridProps<T> = {
    rows: T[]
    hasMore?: boolean
    loadingMore?: boolean
    onLoadMore?: () => void
}

/** Timestamps may arrive as Date or ISO string depending on the codec */
export const isoDate = (value: Date | string | null) =>
    value ? new Date(value).toISOString().slice(0, 10) : "—"
