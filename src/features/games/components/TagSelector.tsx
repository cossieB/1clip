import { createEffect, createMemo, createResource, createSignal, For, Show } from "solid-js";
import { getAllGenres } from "../gamesApi";
import styles from "./TagsCell.module.css"
import { XIcon } from "lucide-solid";

export type Props = {
    genres: string[]
    onUpdate: (val: string[]) => void;
};

const DELIMITER = /[;,]/;

export function TagSelector(props: Props) {

    const [allTags] = createResource(() => getAllGenres(), { initialValue: [] })
    const [tags, setTags] = createSignal<string[]>(props.genres);
    const [inputValue, setInputValue] = createSignal("");

    let inputRef!: HTMLInputElement;
    let containerRef!: HTMLDivElement;

    const filteredSuggestions = createMemo(() => {
        const query = inputValue().trim().toLowerCase();
        const selected = new Set(tags());
        return allTags()
            .map(tag => tag.name)
            .filter(tag => !selected.has(tag) && (query === "" || tag.toLowerCase().includes(query)))
    });
    createEffect(() => props.onUpdate(tags()))
    const addTags = (newTags: string[]) => {
        const cleaned = newTags.map(t => t.trim()).filter(Boolean).map(t => t.toLowerCase());
        if (!cleaned.length) return;
        setTags(prev => Array.from(new Set([...prev, ...cleaned])));
    };

    const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
        const val = e.currentTarget.value;
        if (DELIMITER.test(val)) {
            const parts = val.split(DELIMITER);
            const trailing = parts.pop() ?? "";
            addTags(parts);
            setInputValue(trailing);
        }
        else {
            setInputValue(val);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();


        }
        else if (e.key === "Backspace" && inputValue() === "" && tags().length > 0) {
            setTags(prev => prev.slice(0, -1));
        }
        else if (e.key === "Escape") {
            e.preventDefault();
        }
    };


    return (
        <div class={styles.cellWrapper}>

            <div
                ref={containerRef}
                tabIndex={-1}
                class={styles.portalWrapper}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
            >
                <div class={styles.selectedTags}>
                    <For each={tags()}>
                        {(tag, i) => (
                            <span class={styles.editableTag}>
                                {tag}
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    class={styles.removeBtn}
                                    onClick={(e) => {
                                        setTags(prev => prev.filter((_, idx) => idx !== i()));
                                        e.stopPropagation()
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
                        placeholder={tags().length === 0 ? "Add tags…" : ""}
                        class={styles.tagInput}
                        onInput={handleInput}
                    />
                </div>

                <Show when={filteredSuggestions().length > 0}>
                    <Tags
                        tags={filteredSuggestions()}
                        onClick={(tag) => {
                            addTags([tag]);
                            setInputValue("");
                            inputRef?.focus();
                        }}
                    />
                </Show>
            </div>
        </div>
    );
}

type P = {
    tags: string[]
    onClick: (tag: string) => void
}

export function Tags(props: P) {
    return (
        <div class={styles.dropdown}>
            <For each={props.tags}>
                {tag => (
                    <button
                        style={{ "view-transition-name": `--tag-${tag}` }}
                        type="button"
                        tabIndex={-1}
                        class={styles.dropdownItem}
                        onClick={e => {
                            props.onClick(tag);
                            e.stopPropagation()
                        }}
                    >
                        {tag}
                    </button>
                )}
            </For>
        </div>
    )
}