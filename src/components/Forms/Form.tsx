import { createContext, createMemo, createSignal, For, useContext, type JSXElement } from "solid-js";
import styles from "./Forms.module.css"
import { FormInput } from "./FormInput";
import type z from "zod";
import { useFormContext } from "~/hooks/useFormContext";

type Props = {
    children: JSXElement;
    onSubmit: (e: SubmitEvent) => Promise<unknown>
    disabled: boolean
};

export function Form(props: Props) {
        const {errors} = useFormContext()
        const allErrors = createMemo(() => {
            return Object.values(errors).flat(1)
        })
    return (
        <form class={styles.form} onsubmit={props.onSubmit}>
            {props.children}
            <button disabled={props.disabled || allErrors().length > 0} type="submit">
                Submit
            </button>
        </form>
    )
}

Form.Input = FormInput