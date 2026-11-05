import { createSignal, createUniqueId, flush, For, Show } from "solid-js";
import type { z } from "zod";
import styles from "./ItemList.module.css";
import { JSX } from "@solidjs/web/jsx-runtime";

export type ItemListProps = {
    label: string;
    /** When set, each item is also submitted with the parent form under this name. */
    name?: string;
    /** Pass to control the list; leave out and it manages its own items. */
    value?: string[];
    /** Maximum number of items. Shows a counter and disables adding at the limit. */
    maxItems?: number;
    /** Zod schema applied to each item before it is added. Its output is what gets stored. */
    schema?: z.ZodType<string>;
    /** Type of the draft input, for example "url". Defaults to "text". */
    type?: JSX.InputHTMLAttributes<HTMLInputElement>['type']
    placeholder?: string;
    /** Helper text, replaced by errors and the limit message. */
    hint?: string;
    /** External error (for example from the server). */
    error?: string;
    onChange?: (items: string[]) => void;
};

export function ItemList(props: ItemListProps) {
    const uid = createUniqueId();
    const inputId = `list-${uid}`;
    const noteId = `${inputId}-note`;
    const countId = `${inputId}-count`;

    const [inner, setInner] = createSignal<string[]>([]);
    const [draft, setDraft] = createSignal("");
    const [draftError, setDraftError] = createSignal<string | undefined>(undefined);

    let inputRef: HTMLInputElement | undefined;

    const items = () => props.value ?? inner();
    const atLimit = () => props.maxItems !== undefined && items().length >= props.maxItems;

    const error = () => props.error ?? draftError();
    const note = () =>
        error() ??
        (atLimit() ? `Limit of ${props.maxItems} reached` : props.hint);

    const describedBy = () =>
        [note() ? noteId : undefined, props.maxItems !== undefined ? countId : undefined]
            .filter(Boolean)
            .join(" ") || undefined;

    const commit = (next: string[]) => {
        setInner(next);
        props.onChange?.(next);
    };

    const add = () => {
        const raw = draft().trim();
        if (!raw || atLimit()) return;

        let next = raw;
        if (props.schema) {
            const result = props.schema.safeParse(raw);
            if (!result.success) {
                setDraftError(result.error.issues[0]?.message ?? "Invalid value");
                return;
            }
            next = result.data;
        }

        if (items().includes(next)) {
            setDraftError("Already added");
            return;
        }

        commit([...items(), next]);
        setDraft("");
        setDraftError(undefined);
    };

    const remove = (item: string) => {
        commit(items().filter((x) => x !== item));
        setDraftError(undefined);
        // Let the input re-enable (it is disabled at the limit) before focusing it.
        flush();
        inputRef?.focus();
    };

    return (
        <div class={styles.field} data-invalid={error() ? "" : undefined}>
            <label for={inputId}>{props.label}</label>

            <div class={styles.row}>
                <input
                    ref={(el) => (inputRef = el)}
                    id={inputId}
                    type={props.type ?? "text"}
                    placeholder={props.placeholder}
                    value={draft()}
                    disabled={atLimit()}
                    aria-invalid={error() ? "true" : undefined}
                    aria-describedby={describedBy()}
                    onInput={(e) => {
                        setDraft(e.currentTarget.value);
                        setDraftError(undefined);
                    }}
                    onKeyDown={(e) => {
                        // Enter adds the item instead of submitting the surrounding form.
                        if (e.key === "Enter" && !e.isComposing) {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <button
                    type="button"
                    class={["secondary", styles.add]}
                    disabled={atLimit() || draft().trim() === ""}
                    onClick={add}
                >
                    Add
                </button>
            </div>

            <Show when={note() || props.maxItems !== undefined}>
                <div class={styles.footer}>
                    <Show when={note()}>
                        <p id={noteId} class={styles.note} role={error() ? "alert" : undefined}>
                            {note()}
                        </p>
                    </Show>
                    <Show when={props.maxItems !== undefined}>
                        <span id={countId} class={styles.count} data-level={atLimit() ? "limit" : undefined}>
                            {items().length} / {props.maxItems}
                        </span>
                    </Show>
                </div>
            </Show>

            <Show when={items().length > 0}>
                <ul class={styles.list} role="list" aria-label={`${props.label} items`}>
                    <For each={items()}>
                        {(item) => (
                            <li class={styles.item}>
                                <span class={styles.text} title={item}>
                                    {item}
                                </span>
                                <button
                                    type="button"
                                    class={styles.remove}
                                    aria-label={`Remove ${item}`}
                                    onClick={() => remove(item)}
                                >
                                    ✕
                                </button>
                            </li>
                        )}
                    </For>
                </ul>
            </Show>

            <Show when={props.name}>
                <For each={items()}>
                    {(item) => <input type="hidden" name={props.name} value={item} />}
                </For>
            </Show>
        </div>
    );
}