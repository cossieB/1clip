import { createSignal, For } from "solid-js"
import styles from "./Select.module.css"
import { ChevronDown } from "lucide-solid"
import clickOutside from "~/lib/clickOutside"
false && clickOutside

type Props<T = any> = {
    field: string & keyof T
    list: {value: number | string, label: string}[] | string[]
    setter: (newObj: {value: number | string, label: string} | null) => void
    label?: string
    selected: {value: number | string, label: string} | string | null
    required: boolean
}

export function FormSelect<T>(props: Props<T>) {
    const [isOpen, setIsOpen] = createSignal(false)
    const selected = () => typeof props.selected == "string" ? {label: props.selected, value: props.selected} : props.selected
    return (
        <div
            use:clickOutside={() => setIsOpen(false)}
            role="listbox"
            tabIndex={2}
            class={styles.select}
            onkeypress={e => e.preventDefault}
        >
            <div
                class={styles.header}
                onclick={() => setIsOpen(prev => !prev)}
            >
                <span> {selected()?.label ?? "Select..."} </span>
                <ChevronDown />
            </div>
            <ul class={styles.drawer} classList={{ [styles.isOpen]: isOpen() }}>
                <FormOption
                    item={null}
                    setter={val => {
                        setIsOpen(false);
                        props.setter(val)
                    }}
                />
                <For each={props.list}>
                    {item =>
                        <FormOption
                            item={item}
                            setter={val => {
                                setIsOpen(false);
                                props.setter(val)
                            }}
                        />
                    }
                </For>
            </ul>
        </div>
    )
}

type OptionProps = {
    item: { label: string, value: string | number } | string | null
    setter: Props['setter']
}

function FormOption(props: OptionProps) {
    const item = typeof props.item == "string" ? {label: props.item, value: props.item} : props.item
    return (
        <li
            role="option"
            class={styles.option}
            onclick={() => {
                props.setter(item)
            }}
            onkeypress={e => {
                if (e.key == "Enter") {
                    e.stopImmediatePropagation()
                    e.currentTarget.click()
                }
            }}
        >
            {item?.label ?? "<nil>"}
        </li>
    )
}