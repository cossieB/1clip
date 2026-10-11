import { createMemo, For, Match, Switch, type JSX } from "solid-js"
import styles from "./CheckboxList.module.css"

export type CheckboxListProps<T, K extends string | number> = {
    /** Accessible name for the group, shown as its heading */
    label: string
    /** `undefined` is treated as "nothing to show yet" */
    items: readonly T[] | undefined
    /** Stable, unique identifier for an item (an id, not an array index) */
    getKey: (item: T) => K
    getLabel: (item: T) => string
    /** Custom label content; defaults to `getLabel(item)` */
    renderLabel?: (item: T) => JSX.Element
    /** Keys of the checked items (controlled) */
    value: readonly K[]
    /**
     * Called with the next list of checked keys. New picks are appended in click order,
     * and keys that don't match any current item are left untouched.
     */
    onChange: (value: K[]) => void
    isLoading?: boolean
    isError?: boolean
    /** Plural noun for status messages: "No {noun} available". Defaults to "options" */
    noun?: string
    disabled?: boolean
}

export function CheckboxList<T, K extends string | number>(props: CheckboxListProps<T, K>) {
    const selected = createMemo(() => new Set<K>(props.value))
    const noun = () => props.noun ?? "options"

    const toggle = (key: K, checked: boolean) => {
        if (checked) {
            if (!selected().has(key)) props.onChange([...props.value, key])
        } else {
            props.onChange(props.value.filter((existing) => existing !== key))
        }
    }

    return (
        <fieldset class={styles.root} disabled={props.disabled}>
            <legend class={styles.legend}>{props.label}</legend>

            <Switch>
                <Match when={props.isLoading}>
                    <p class={styles.message} role="status">Loading {noun()}…</p>
                </Match>
                <Match when={props.isError}>
                    <p class={`${styles.message} ${styles.messageError}`} role="status">Couldn't load {noun()}.</p>
                </Match>
                <Match when={!props.items?.length}>
                    <p class={styles.message}>No {noun()} available.</p>
                </Match>
                <Match when={true}>
                    <ul class={styles.list}>
                        <For each={props.items}>
                            {(item) => {
                                const key = props.getKey(item)
                                return (
                                    <li>
                                        <label class={styles.option}>
                                            <input
                                                class={styles.input}
                                                type="checkbox"
                                                checked={selected().has(key)}
                                                onChange={(e) => toggle(key, e.currentTarget.checked)}
                                            />
                                            <span class={styles.text}>
                                                {props.renderLabel ? props.renderLabel(item) : props.getLabel(item)}
                                            </span>
                                        </label>
                                    </li>
                                )
                            }}
                        </For>
                    </ul>
                </Match>
            </Switch>
        </fieldset>
    )
}