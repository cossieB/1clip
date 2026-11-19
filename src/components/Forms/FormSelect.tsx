import { For, merge } from "solid-js";

type BaseProps<T, V extends string | number> = {
    list: T[];
    setSelected: (newObj: T | null) => void;
    selected: V | null;
    label: string
};

type ConditionalProps<T, V extends string | number> = T extends string
    ? {
        // Optional when T is string
        getLabel?: (item: T) => string;
        getValue?: (item: T) => V;
    }
    : {
        // Required when T is anything else
        getLabel: (item: T) => string;
        getValue: (item: T) => V;
    };

type SelectProps<T, V extends string | number> = BaseProps<T, V> & ConditionalProps<T, V>;

export function FormSelect<T, V extends string | number>(_props: SelectProps<T, V>) {
    const props = merge({
        getLabel: (val: string) => val,
        getValue: (val: string) => val
    }, _props)

    const selected = () => props.list.find(x => props.getValue(x) == props.selected)

    return (
        <select >
            <option disabled selected={!selected()} value="">{props.label}</option>
            <For each={props.list}>
                {item => (
                    <option
                        selected={selected() == item}
                        value={props.getValue(item)}
                        onClick={() => props.setSelected(item)}
                    >
                        {props.getLabel(item)}
                    </option>
                )}
            </For>
        </select>
    )
}