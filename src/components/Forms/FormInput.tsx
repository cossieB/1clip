import { For, splitProps, type ComponentProps } from "solid-js"
import styles from "./Forms.module.css"
import { useFormContext } from "~/hooks/useFormContext"
import titleCase from "~/lib/titleCase"

type Props<T = any> = ({
    field: string & keyof T
    value: string
    setter: (val: string) => void
    label?: string
    validator?: (newVal: string) => string[]
    onErr?: (err: string) => void
}) & ComponentProps<"input">

export function FormInput<T>(props: Props<T>) {
    const [p, rest] = splitProps(props, ["value", "setter", "label", "validator"])
    const { errors, setErrors } = useFormContext()
    const err = () => errors[props.field]

    return (
        <div class={styles.formControl}>
            <input
                {...rest}
                placeholder=" "
                oninput={() => {
                    setErrors(props.field, [])
                }}
                value={p.value}
                onchange={e => {
                    const newVal = props.field.toLowerCase().includes("password") ? e.currentTarget.value : e.currentTarget.value.trim()
                    p.setter(newVal)
                    if (!p.validator) return
                    const errs = p.validator(newVal)
                    setErrors(props.field, prev => [...prev, ...errs])
                }}
            />
            <label> {p.label ?? titleCase(props.field)} {props.required && "*"} </label>
            <div class={styles.errs}>
                <ul>

                    <For each={err()}>
                        {e => <li> {e} </li>}
                    </For>
                </ul>
            </div>

        </div>
    )
}

export function StandaloneInput(props: Props) {
    return (
        <div class={styles.formControl}>
            <input onchange={e => props.setter(e.currentTarget.value)} />
            <label > {props.label} </label>
        </div>
    )
}