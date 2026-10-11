import { createEffect, createSignal, createUniqueId, For, Match, on, Show, Switch, type JSX } from "solid-js"
import { useQuery } from "@tanstack/solid-query"
// Adjust this import to wherever it lives in your project
import { useAbortController } from "~/hooks/useAbortController"
import styles from "./SearchAutocomplete.module.css"
import { debounce } from "~/lib/debounce"

export type SearchAutocompleteProps<T> = {
    /** Accessible name for the input, also used as the placeholder unless `placeholder` is set */
    label: string
    /** Namespace for the query cache. Must be unique per kind of search, e.g. "games" */
    queryKey: string
    /** Fetch the results for a query. Called once the user stops typing */
    search: (query: string, signal: AbortSignal) => Promise<T[]>
    /** Text shown in the input once an item is picked (and used as the default row content) */
    getLabel: (item: T) => string
    onSelect?: (item: T) => void
    /** Hide results the caller doesn't want offered (e.g. already added). Tracked reactively */
    exclude?: (item: T) => boolean
    /** Empty the input after a pick instead of filling it with the item's label */
    clearOnSelect?: boolean
    /** Custom row content; defaults to `getLabel(item)` */
    renderItem?: (item: T) => JSX.Element
    placeholder?: string
    /** Plural noun for status messages: "No {noun} match …". Defaults to "results" */
    noun?: string
    /** Read once on mount, changing it later has no effect. Defaults to 300 */
    debounceMs?: number
}

export function SearchAutocomplete<T>(props: SearchAutocompleteProps<T>) {
    const listboxId = createUniqueId()
    const optionId = (index: number) => `${listboxId}-${index}`

    const [inputValue, setInputValue] = createSignal("")
    const [searchQuery, setSearchQuery] = createSignal("")
    const [isTyping, setIsTyping] = createSignal(false)
    const [isOpen, setIsOpen] = createSignal(false)
    const [activeIndex, setActiveIndex] = createSignal(-1)

    const abortController = useAbortController()
    const updateSearchQuery = debounce((value: string) => {
        setSearchQuery(value)
        setIsTyping(false)
    }, props.debounceMs ?? 300, abortController.signal)

    const searchResults = useQuery(() => ({
        queryKey: [props.queryKey, searchQuery()],
        enabled: !!searchQuery(),
        queryFn: () => props.search(searchQuery(), abortController.signal)
    }))

    const items = (): T[] => (searchResults.data ?? []).filter((item) => !props.exclude?.(item))
    const activeItem = () => items()[activeIndex()]
    const noun = () => props.noun ?? "results"

    const showPanel = () => isOpen() && inputValue().trim() !== ""
    const status = () => {
        // Debounce pending, or request in flight
        if (isTyping() || searchResults.isFetching) return "loading"
        if (searchResults.isError) return "error"
        if (items().length === 0) return "empty"
        return "results"
    }
    const showList = () => showPanel() && status() === "results"

    // Reset the highlighted option whenever new results arrive
    createEffect(on(() => searchResults.data, () => setActiveIndex(-1)))

    // Keep the highlighted option visible when navigating with the keyboard
    createEffect(() => {
        const index = activeIndex()
        if (index >= 0) document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" })
    })

    const handleInput = (value: string) => {
        setInputValue(value)
        setIsOpen(true)
        setIsTyping(true)
        updateSearchQuery(value.trim())
    }

    const select = (item: T) => {
        setInputValue(props.clearOnSelect ? "" : props.getLabel(item))
        setIsOpen(false)
        setActiveIndex(-1)
        props.onSelect?.(item)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        const count = items().length

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault()
                setIsOpen(true)
                if (count) setActiveIndex((i) => (i + 1) % count)
                break
            case "ArrowUp":
                event.preventDefault()
                setIsOpen(true)
                if (count) setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1))
                break
            case "Enter": {
                const item = activeItem()
                if (showList() && item !== undefined) {
                    event.preventDefault()
                    select(item)
                }
                break
            }
            case "Escape":
                if (showPanel()) event.preventDefault() // don't let type="search" clear the field
                setIsOpen(false)
                setActiveIndex(-1)
                break
        }
    }

    return (
        <div class={styles.root}>
            <div class={styles.field}>
                <svg class={styles.icon} viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
                    <circle cx="8.5" cy="8.5" r="5.5" />
                    <path d="M12.75 12.75 17 17" />
                </svg>
                <input
                    class={styles.input}
                    type="search"
                    placeholder={props.placeholder ?? props.label}
                    autocomplete="off"
                    role="combobox"
                    aria-label={props.label}
                    aria-autocomplete="list"
                    aria-expanded={showList()}
                    aria-controls={showList() ? listboxId : undefined}
                    aria-activedescendant={showList() && activeIndex() >= 0 ? optionId(activeIndex()) : undefined}
                    value={inputValue()}
                    onInput={(e) => handleInput(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setIsOpen(false)}
                />
            </div>

            <Show when={showPanel()}>
                <div class={styles.panel}>
                    <Switch>
                        <Match when={status() === "results"}>
                            <ul class={styles.list} id={listboxId} role="listbox" aria-label={`${props.label} suggestions`}>
                                <For each={items()}>
                                    {(item, index) => (
                                        <li
                                            class={styles.option}
                                            id={optionId(index())}
                                            role="option"
                                            aria-selected={index() === activeIndex()}
                                            // Keep focus on the input so blur doesn't close the list before the click lands
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => select(item)}
                                            onMouseMove={() => setActiveIndex(index())}
                                        >
                                            {props.renderItem ? props.renderItem(item) : props.getLabel(item)}
                                        </li>
                                    )}
                                </For>
                            </ul>
                        </Match>
                        <Match when={status() === "loading"}>
                            <p class={styles.message} role="status">
                                <span class={styles.spinner} aria-hidden="true" />
                                Searching…
                            </p>
                        </Match>
                        <Match when={status() === "error"}>
                            <p class={`${styles.message} ${styles.messageError}`} role="status">
                                Couldn't load {noun()}. Try again.
                            </p>
                        </Match>
                        <Match when={status() === "empty"}>
                            <p class={styles.message} role="status">
                                No {noun()} match “{searchQuery()}”
                            </p>
                        </Match>
                    </Switch>
                </div>
            </Show>
        </div>
    )
}