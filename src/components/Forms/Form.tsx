import { createMemo, Show, type JSXElement } from "solid-js";
import { createStore } from "solid-js/store";
import styles from "./Forms.module.css"
import { FormInput } from "./FormInput";
import { Formtextarea } from "./FormTextarea";
import { FormSelect } from "./Select";
import { TagsInput } from "./TagsInput";
import { FormContext } from "./FormContext";

type Props = {
    children: JSXElement;
    onSubmit: (e: SubmitEvent) => Promise<unknown>
    disabled?: boolean
    isPending: boolean
};

export function Form(props: Props) {
    const [errors, setErrors] = createStore<Record<string, string[]>>({})
    const allErrors = createMemo(() => {
        return Object.values(errors).flat(1)
    })
    return (
        <FormContext.Provider value={{ errors, setErrors }}>
            <form class={styles.form} onsubmit={props.onSubmit}>
                {props.children}
                <button disabled={props.isPending || props.disabled || allErrors().length > 0} type="submit">
                    <Show when={props.isPending} fallback={"Submit"}>
                        <div class={styles.dot} style={{ "--delay": "0.5s" }} />
                        <div class={styles.dot} style={{ "--delay": "1s" }} />
                        <div class={styles.dot} style={{ "--delay": "1.5s" }} />
                    </Show>
                </button>
            </form>
        </FormContext.Provider>
    )
}

Form.Input = FormInput
Form.Textarea = Formtextarea
Form.FormSelect = FormSelect
Form.TagsInput = TagsInput