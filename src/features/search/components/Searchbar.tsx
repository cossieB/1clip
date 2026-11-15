import { Errored, For, Loading, Show, createMemo, createSignal, createUniqueId, isPending, onCleanup } from "solid-js"
import styles from "./Searchbar.module.css"
import { mediaSrc } from "~/utils/mediaSrc"
import { SearchIcon } from "@lucide/solid"
import { searchSuggestionsFn } from "../searchApi"

const MIN_LENGTH = 2
const DEBOUNCE_MS = 250

type Suggestions = Awaited<ReturnType<typeof searchSuggestionsFn>>

const total = (data: Suggestions) => data.games.length + data.posts.length + data.squads.length

export function SearchBar() {
    const panelId = createUniqueId()
    let root!: HTMLFormElement
    let input!: HTMLInputElement
    let timer: ReturnType<typeof setTimeout> | undefined

    const [term, setTerm] = createSignal("") // debounced, trimmed
    const [open, setOpen] = createSignal(false)

    onCleanup(() => clearTimeout(timer))

    // Async memo: a newer term supersedes an in-flight request, so a slow answer can't overwrite a fast one.
    const results = createMemo(() => {
        const q = term()
        return q.length >= MIN_LENGTH ? searchSuggestionsFn(q) : null
    })
    const refreshing = () => isPending(() => results())

    const visible = () => open() && term().length >= MIN_LENGTH

    const onInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
        const value = e.currentTarget.value.trim()
        clearTimeout(timer)
        setOpen(true)
        if (value.length < MIN_LENGTH) {
            setTerm("")
        } else {
            timer = setTimeout(() => setTerm(value), DEBOUNCE_MS)
        }
    }

    const onSubmit = (e: SubmitEvent) => {
        if (input.value.trim().length === 0) e.preventDefault()
    }

    // Arrow keys move real focus between the result links; Escape closes the panel.
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setOpen(false)
            input.focus()
            return
        }
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return

        const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-result]"))
        if (links.length === 0) return

        e.preventDefault()
        const current = links.indexOf(document.activeElement as HTMLAnchorElement) // -1 while in the input
        const next = e.key === "ArrowDown" ? current + 1 : current - 1

        if (next < 0) input.focus()
        else links[Math.min(next, links.length - 1)].focus()
    }

    const onFocusOut = (e: FocusEvent) => {
        if (!root.contains(e.relatedTarget as Node | null)) setOpen(false)
    }

    return (
        <form
            ref={root}
            class={styles.search}
            role="search"
            action="/search"
            method="get"
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            onFocusOut={onFocusOut}
        >
            <SearchIcon size={18} class={styles.icon} />

            <input
                ref={input}
                class={["cutout", styles.input]}
                type="search"
                name="q"
                placeholder="Search squads, posts, games"
                aria-label="Search squads, posts and games"
                aria-controls={panelId}
                // aria-expanded={visible()}
                autocomplete="off"
                spellcheck={false}
                enterkeyhint="search"
                maxlength={100}
                onInput={onInput}
                onFocus={() => setOpen(true)}
            />

            <Show when={visible()}>
                {/* keeps focus in the input while the panel is clicked, so it isn't unmounted before the click lands */}
                <div
                    id={panelId}
                    class={styles.panel}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setOpen(false)}
                >
                    <Errored fallback={<p class={styles.status}>Search failed. Please try again.</p>}>
                        <Loading fallback={<p class={styles.status}>Searching…</p>}>
                            <Show when={results()}>
                                {data => (
                                    <div class={[styles.content, { [styles.stale]: refreshing() }]}>
                                        <Show
                                            when={total(data()) > 0}
                                            fallback={<p class={styles.status}>No results for “{term()}”.</p>}
                                        >
                                            <Show when={data().games.length}>
                                                <section class={styles.group}>
                                                    <h3 class={styles.groupTitle}>Games</h3>
                                                    <ul>
                                                        <For each={data().games}>
                                                            {game => (
                                                                <li>
                                                                    <a class={styles.row} data-result href={`/games/${game.gameId}`}>
                                                                        <img
                                                                            class={["cutout", styles.thumb]}
                                                                            src={mediaSrc(game.cover)}
                                                                            alt=""
                                                                            width="32"
                                                                            height="42"
                                                                            loading="lazy"
                                                                        />
                                                                        <span class={styles.text}>
                                                                            <span class={styles.primary}>{game.title}</span>
                                                                            <span class={styles.secondary}>
                                                                                {game.releaseDate.slice(0, 4)}
                                                                            </span>
                                                                        </span>
                                                                    </a>
                                                                </li>
                                                            )}
                                                        </For>
                                                    </ul>
                                                </section>
                                            </Show>

                                            <Show when={data().posts.length}>
                                                <section class={styles.group}>
                                                    <h3 class={styles.groupTitle}>Posts</h3>
                                                    <ul>
                                                        <For each={data().posts}>
                                                            {post => (
                                                                <li>
                                                                    <a class={styles.row} data-result href={`/posts/${post.postId}`}>
                                                                        <span class={styles.text}>
                                                                            <span class={styles.primary}>{post.title}</span>
                                                                            <span class={styles.secondary}>@{post.author.username}</span>
                                                                        </span>
                                                                    </a>
                                                                </li>
                                                            )}
                                                        </For>
                                                    </ul>
                                                </section>
                                            </Show>

                                            <Show when={data().squads.length}>
                                                <section class={styles.group}>
                                                    <h3 class={styles.groupTitle}>Looking for group</h3>
                                                    <ul>
                                                        <For each={data().squads}>
                                                            {squad => (
                                                                <li>
                                                                    <a class={styles.row} data-result href={`/squads/${squad.squadId}`}>
                                                                        <span class={styles.text}>
                                                                            <span class={styles.primary}>
                                                                                {squad.game?.title ?? "Looking for group"}
                                                                            </span>
                                                                            <span class={styles.secondary}>
                                                                                @{squad.creator.username}
                                                                                {squad.text ? ` · ${squad.text}` : ""}
                                                                            </span>
                                                                        </span>
                                                                    </a>
                                                                </li>
                                                            )}
                                                        </For>
                                                    </ul>
                                                </section>
                                            </Show>

                                            <a
                                                class={styles.viewAll}
                                                data-result
                                                href={`/search?q=${encodeURIComponent(term())}`}
                                            >
                                                See all results for “{term()}”
                                            </a>
                                        </Show>
                                    </div>
                                )}
                            </Show>
                        </Loading>
                    </Errored>
                </div>
            </Show>
        </form>
    )
}