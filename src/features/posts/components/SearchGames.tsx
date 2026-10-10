import { createEffect, createSignal, createUniqueId, For, Match, on, Show, Switch } from "solid-js"
import { useQuery } from "@tanstack/solid-query"
// Adjust these two imports to wherever they live in your project
import { useAbortController } from "~/hooks/useAbortController"
import styles from "./SearchGames.module.css"
import { getGamesWithoutExtras } from "~/features/games/gamesApi"
import { debounce } from "~/lib/debounce"
 
type GetGamesReturnType = {
    title: string,
    gameId: number
}[]
 
type Game = GetGamesReturnType[number]
 
type SearchGamesProps = {
    onSelect?: (game: Game) => void
}
 
export function SearchGames(props: SearchGamesProps) {
    const listboxId = createUniqueId()
    const optionId = (game: Game) => `${listboxId}-${game.gameId}`
 
    const [inputValue, setInputValue] = createSignal("")
    const [searchQuery, setSearchQuery] = createSignal("")
    const [isTyping, setIsTyping] = createSignal(false)
    const [isOpen, setIsOpen] = createSignal(false)
    const [activeIndex, setActiveIndex] = createSignal(-1)
 
    const abortController = useAbortController()
    const updateSearchQuery = debounce((value: string) => {
        setSearchQuery(value)
        setIsTyping(false)
    }, 300, abortController.signal)
 
    const searchResults = useQuery(() => ({
        queryKey: ["s", searchQuery()],
        enabled: !!searchQuery(),
        queryFn: () => getGamesWithoutExtras({ data: searchQuery(), signal: abortController.signal })
    }))
 
    const games = (): GetGamesReturnType => searchResults.data ?? []
    const activeGame = () => games()[activeIndex()]
 
    const showPanel = () => isOpen() && inputValue().trim() !== ""
    // Debounce pending, or request in flight
    const status = () => {
        if (isTyping() || searchResults.isFetching) return "loading"
        if (searchResults.isError) return "error"
        if (games().length === 0) return "empty"
        return "results"
    }
    const showList = () => showPanel() && status() === "results"
 
    // Reset the highlighted option whenever new results arrive
    createEffect(on(() => searchResults.data, () => setActiveIndex(-1)))
 
    // Keep the highlighted option visible when navigating with the keyboard
    createEffect(() => {
        const game = activeGame()
        if (game) document.getElementById(optionId(game))?.scrollIntoView({ block: "nearest" })
    })
 
    const handleInput = (value: string) => {
        setInputValue(value)
        setIsOpen(true)
        setIsTyping(true)
        updateSearchQuery(value.trim())
    }
 
    const select = (game: Game) => {
        setInputValue(game.title)
        setIsOpen(false)
        setActiveIndex(-1)
        props.onSelect?.(game)
    }
 
    const handleKeyDown = (event: KeyboardEvent) => {
        const count = games().length
 
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
                const game = activeGame()
                if (showList() && game) {
                    event.preventDefault()
                    select(game)
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
                <input
                    class={styles.input}
                    type="search"
                    placeholder="Search games"
                    autocomplete="off"
                    role="combobox"
                    aria-label="Search games"
                    aria-autocomplete="list"
                    aria-expanded={showList()}
                    aria-controls={showList() ? listboxId : undefined}
                    aria-activedescendant={showList() && activeGame() ? optionId(activeGame()!) : undefined}
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
                            <ul class={styles.list} id={listboxId} role="listbox" aria-label="Game suggestions">
                                <For each={games()}>
                                    {(game, index) => (
                                        <li
                                            class={styles.option}
                                            id={optionId(game)}
                                            role="option"
                                            aria-selected={index() === activeIndex()}
                                            // Keep focus on the input so blur doesn't close the list before the click lands
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => select(game)}
                                            onMouseMove={() => setActiveIndex(index())}
                                        >
                                            {game.title}
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
                                Couldn't load games. Try again.
                            </p>
                        </Match>
                        <Match when={status() === "empty"}>
                            <p class={styles.message} role="status">
                                No games match “{searchQuery()}”
                            </p>
                        </Match>
                    </Switch>
                </div>
            </Show>
        </div>
    )
}
