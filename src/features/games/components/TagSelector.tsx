import { createEffect, createMemo, createSignal, createStore, For, Loading, Show, untrack } from "solid-js";
import { getAllGenresFn } from "../gamesApi";
import styles from "./TagSelector.module.css";
import { XIcon } from "@lucide/solid";

export type Props = {
    genres: string[];
    onUpdate: (val: string[]) => void;
};

const DELIMITER = /[;,]/;

export function TagSelector(props: Props) {
    // Async memo replaces createResource; it's read under <Loading> below
    const allTags = createMemo(() => getAllGenresFn());

    // Seed once from props, deliberately untracked
    const [tags, setTags] = createStore<string[]>(untrack(() => props.genres));
    const [inputValue, setInputValue] = createSignal("");

    let inputRef!: HTMLInputElement;

    const filteredSuggestions = createMemo(() => {
        const query = inputValue().trim().toLowerCase();
        const selected = new Set(tags);
        return allTags()
            .map(tag => tag.name)
            .filter(tag => !selected.has(tag) && (query === "" || tag.toLowerCase().includes(query)));
    });

    
    createEffect(() => tags, value => props.onUpdate(value));

    const addTags = (newTags: string[]) => {
        const set = new Set(tags)
        const cleaned = newTags.map(t => t.trim().toLowerCase()).filter(Boolean).filter(t => !set.has(t));
        if (!cleaned.length) return;
        setTags(draft => {
            draft.push(...cleaned)
        })
    };

    const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
        const val = e.currentTarget.value;
        if (DELIMITER.test(val)) {
            const parts = val.split(DELIMITER);
            const trailing = parts.pop() ?? "";
            addTags(parts);
            setInputValue(trailing);
        } else {
            setInputValue(val);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTags([inputValue()]);
            setInputValue("");
        } else if (e.key === "Backspace" && inputValue() === "" && tags.length > 0) {
            setTags(prev => prev.slice(0, -1));
        } else if (e.key === "Escape") {
            e.preventDefault();
        }
    };

    return (
        <div class={styles.cellWrapper}>
            <div
                tabindex={-1}
                class={styles.portalWrapper}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
            >
                <div class={styles.selectedTags}>
                    
                    <For each={tags}>
                        {(tag, i) => (
                            <span class={styles.editableTag}>
                                {tag}
                                <button
                                    type="button"
                                    tabindex={-1}
                                    class={styles.removeBtn}
                                    aria-label={`Remove ${tag}`}
                                    onClick={e => {
                                        setTags(prev => prev.filter((_, idx) => idx !== i()));
                                        e.stopPropagation();
                                    }}
                                >
                                    <XIcon size={12} />
                                </button>
                            </span>
                        )}
                    </For>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue()}
                        placeholder={tags.length === 0 ? "Add tags…" : ""}
                        class={styles.tagInput}
                        onInput={handleInput}
                    />
                </div>

                <Loading fallback={<div class={styles.status}>Loading genres…</div>}>
                    <Show when={filteredSuggestions().length > 0}>
                        <Tags
                            tags={filteredSuggestions()}
                            onClick={tag => {
                                addTags([tag]);
                                setInputValue("");
                                inputRef?.focus();
                            }}
                        />
                    </Show>
                </Loading>
            </div>
        </div>
    );
}

type P = {
    tags: string[];
    onClick: (tag: string) => void;
};

export function Tags(props: P) {
    return (
        <div class={styles.dropdown}>
            <For each={props.tags}>
                {tag => (
                    <button
                        type="button"
                        tabindex={-1}
                        class={styles.dropdownItem}
                        onClick={e => {
                            props.onClick(tag);
                            e.stopPropagation();
                        }}
                    >
                        {tag}
                    </button>
                )}
            </For>
        </div>
    );
}