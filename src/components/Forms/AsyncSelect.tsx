import { SolidQueryOptions, useQuery } from "@tanstack/solid-query"
import { FormSelect } from "./Select"
import { createEffect, Suspense } from "solid-js"

type Props<T> = {
    queryOptions: SolidQueryOptions<T[] | undefined> & {initialData: undefined}
    getValue: (item: T) => string | number
    getLabel: (item: T) => string
    field: string 
    selected: string | number | null
    setter: (val: string | number | null) => void
    label?: string
}

export function AsyncSelect<T>(props: Props<T>) {
    const result = useQuery(() => props.queryOptions);

    return (
        <Suspense>
            <FormSelect
                field={props.field}
                list={(result.data ?? []).map(item => ({
                    label: props.getLabel(item),
                    value: props.getValue(item)
                }))}
                required
                selected={props.selected}
                setter={obj => props.setter(obj?.value ?? null)}
                label={props.label}
            />
        </Suspense>
    )
}
