import { createSignal, createUniqueId, omit, Show } from "solid-js";
import styles from "./Textarea.module.css";
import { JSX } from "@solidjs/web/jsx-runtime";

export type TextAreaProps = Omit<
    JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onInput" | "maxLength"
> & {
    label: string;
    /** Hard limit on the number of characters. Shows a counter when set. */
    maxLength?: number;
    /** Pass to control the field; leave out and it manages its own value. */
    value?: string;
    /** Helper text, replaced by the error while one is showing. */
    hint?: string;
    error?: string;
    onInput?: (value: string) => void;
};

export function TextArea(props: TextAreaProps) {
    const rest = omit(
        props,
        "label",
        "maxLength",
        "value",
        "hint",
        "error",
        "onInput",
        "id",
    );

    const uid = createUniqueId();
    const id = () => props.id ?? `field-${uid}`;
    const noteId = () => `${id()}-note`;
    const countId = () => `${id()}-count`;

    const [inner, setInner] = createSignal("");
    const value = () => props.value ?? inner();
    const count = () => value().length;

    // "limit" at the cap, "near" from 90% up, so the counter can warn before typing stops.
    const level = () => {
        const max = props.maxLength;
        if (max === undefined) return undefined;
        if (count() >= max) return "limit";
        if (count() >= max * 0.9) return "near";
        return undefined;
    };

    const note = () => props.error ?? props.hint;

    const describedBy = () =>
        [note() ? noteId() : undefined, props.maxLength !== undefined ? countId() : undefined]
            .filter(Boolean)
            .join(" ") || undefined;

    return (
        <div class={styles.field} data-invalid={props.error ? "" : undefined}>
            <label for={id()}>{props.label}</label>
            <textarea
                {...rest}
                id={id()}
                value={value()}
                maxlength={props.maxLength}
                aria-invalid={props.error ? "true" : undefined}
                aria-describedby={describedBy()}
                onInput={(e) => {
                    setInner(e.currentTarget.value);
                    props.onInput?.(e.currentTarget.value);
                }}
            />
            <Show when={note() || props.maxLength !== undefined}>
                <div class={styles.footer}>
                    <Show when={note()}>
                        <p
                            id={noteId()}
                            class={styles.note}
                            role={props.error ? "alert" : undefined}
                        >
                            {note()}
                        </p>
                    </Show>
                    <Show when={props.maxLength !== undefined}>
                        <span id={countId()} class={styles.count} data-level={level()}>
                            {count()} / {props.maxLength}
                        </span>
                    </Show>
                </div>
            </Show>
        </div>
    );
}