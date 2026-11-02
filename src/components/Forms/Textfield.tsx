import { createMemo, createSignal, createUniqueId, omit, Show } from "solid-js";
import type { z } from "zod";
import styles from "./TextField.module.css";
import { JSX } from "@solidjs/web/jsx-runtime";

export type TextFieldProps = Omit<
    JSX.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onInput" | "onBlur"
> & {
    label: string;
    /** Pass to control the field; leave out and it manages its own value. */
    value?: string;
    /** Helper text, replaced by the error while one is showing. */
    hint?: string;
    /** External error (for example from the server). Always wins over the schema. */
    error?: string;
    /** Zod schema for the value. The first issue's message is shown. */
    schema?: z.ZodType;
    /** Show schema errors before the field has been blurred, such as on submit. */
    showErrors?: boolean;
    onInput?: (value: string) => void;
};

export function TextField(props: TextFieldProps) {
    const rest = omit(
        props,
        "label",
        "value",
        "hint",
        "error",
        "schema",
        "showErrors",
        "onInput",
        "id",
    );

    const uid = createUniqueId();
    const id = () => props.id ?? `field-${uid}`;
    const noteId = () => `${id()}-note`;

    const [inner, setInner] = createSignal("");
    const [touched, setTouched] = createSignal(false);

    const value = () => props.value ?? inner();

    const failure = createMemo(() => {
        const result = props.schema?.safeParse(value());
        return result && !result.success ? result.error.issues[0]?.message : undefined;
    });

    // Wait until the person has left the field (or the form asks) before scolding.
    const message = () =>
        props.error ?? (touched() || props.showErrors ? failure() : undefined);

    const note = () => message() ?? props.hint;

    return (
        <div class={styles.field} data-invalid={message() ? "" : undefined}>
            <label for={id()}>{props.label}</label>
            <input
                {...rest}
                id={id()}
                value={value()}
                aria-invalid={message() ? "true" : undefined}
                aria-describedby={note() ? noteId() : undefined}
                onInput={(e) => {
                    setInner(e.currentTarget.value);
                    props.onInput?.(e.currentTarget.value);
                }}
                onBlur={() => setTouched(true)}
            />
            <Show when={note()}>
                <p
                    id={noteId()}
                    class={styles.note}
                    role={message() ? "alert" : undefined}
                >
                    {note()}
                </p>
            </Show>
        </div>
    );
}