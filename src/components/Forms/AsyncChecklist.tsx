import { createEffect, createResource, For, Suspense } from "solid-js"
import { SolidQueryOptions, useQuery } from "@tanstack/solid-query"
import { getPlatformsFn } from "~/serverFn/platforms"

type Props<T, V extends string | number> = {
    queryOptions: SolidQueryOptions<T[] | undefined> & { initialData: undefined }
    getLabel: (item: T) => string
    getValue: (item: T) => V
    setter: (values: T[]) => void
    selected: T[]
}

export function AsyncChecklist<T, V extends string | number>(props: Props<T, V>) {
    const result = useQuery(() => props.queryOptions);
    return (
        <Suspense>
            <For each={result.data}>
                {(item, i) =>
                    <div>
                        <input
                            type="checkbox"
                            checked={props.selected.map(props.getValue).includes(props.getValue(item))}
                            onChange={e => {
                                let arr: T[]
                                if (e.currentTarget.checked) {
                                    arr = [...props.selected, item]
                                }
                                else {
                                    arr = props.selected.filter(x => props.getValue(x) != props.getValue(item))
                                }
                                props.setter(arr)
                            }}
                        />
                        <label> {props.getLabel(item)} </label>
                    </div>
                }
            </For>
        </Suspense>
    )
}
