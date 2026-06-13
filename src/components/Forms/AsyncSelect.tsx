import { QueryOptions, useQuery } from "@tanstack/solid-query"
import { FormSelect } from "./Select"
import { createEffect, Suspense } from "solid-js"

type Props<T, V extends string | number> = {
    queryOptions: QueryOptions<T[] | undefined> & {initialData: undefined}
    getValue: (item: T) => V
    getLabel: (item: T) => string
    field: string 
    selected: V | null
    setSelected: (val: T) => void
    label?: string
}

export function AsyncSelect<T, V extends string | number>(props: Props<T, V>) {
    const result = useQuery(() => props.queryOptions);

    return (
        <Suspense>
            {/* @ts-expect-error */}
            <FormSelect
                list={result.data ?? []}
                selected={props.selected}
                setSelected={obj => props.setSelected(obj!)}
                label={props.label}
                getIdentifier={props.getValue}
                getLabel={props.getLabel}
            />
        </Suspense>
    )
}
