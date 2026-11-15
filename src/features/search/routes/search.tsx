// routes/search.tsx
import { Errored, For, Loading, Match, Show, Switch, createMemo, isPending } from "solid-js"
import { Meta, Title } from "@solidjs/meta"
import { useSearchParams } from "@solidjs/router"
import { searchFn, type SearchType } from "../searchApi" // adjust paths
import styles from "./search.module.css"
import { mediaSrc } from "~/utils/mediaSrc"
import { Bone } from "~/components/Skeletons/Skeletons"
import { paths } from "~/router"

const MIN_LENGTH = 2
const PAGE_SIZE = 20 // must match the limit in searchFn
const MAX_PAGE = 500 // searchFn caps the offset at 10,000

const TABS: { type: SearchType; label: string }[] = [
    { type: "games", label: "Games" },
    { type: "posts", label: "Posts" },
    { type: "squads", label: "Looking for group" },
]

type Result = Awaited<ReturnType<typeof searchFn>>

const dateFormat = new Intl.DateTimeFormat("en-za", { dateStyle: "medium", timeZone: "UTC" })

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? ""

/** Narrows the union returned by searchFn to one kind's items. */
function itemsOf<T extends Result["type"]>(data: Result, type: T) {
    return data.type === type ? (data.items as Extract<Result, { type: T }>["items"]) : undefined
}

export default function SearchPage() {
    const [params] = useSearchParams(paths.search)

    const query = () => first(params.q).trim().slice(0, 100)
    const type = (): SearchType => {
        const value = first(params.type)
        return TABS.some(tab => tab.type === value) ? (value as SearchType) : "games"
    }
    const page = () => Math.min(Math.max(parseInt(first(params.page)) || 1, 1), MAX_PAGE)
    const ready = () => query().length >= MIN_LENGTH

    // Async memo: changing the tab or page holds the old results (dimmed) until the new ones land.
    const results = createMemo(() =>
        ready() ? searchFn({ query: query(), type: type(), offset: (page() - 1) * PAGE_SIZE }) : null,
    )
    const refreshing = () => isPending(() => results())

    const hrefFor = (next: { type?: SearchType; page?: number }) => {
        const search = new URLSearchParams({ q: query(), type: next.type ?? type() })
        if (next.page && next.page > 1) search.set("page", String(next.page))
        return `/search?${search}`
    }

    return (
        <main class={styles.page}>
            <Title>{ready() ? `${query()} – Search | 1Clip` : "Search | 1Clip"}</Title>
            <Meta name="robots" content="noindex" />

            <header class={styles.header}>
                <h1 class={styles.title}>Search</h1>
                <p class={styles.summary}>
                    <Show when={ready()} fallback={`Type at least ${MIN_LENGTH} characters to search.`}>
                        Results for “{query()}”
                    </Show>
                </p>
            </header>

            <Show when={ready()}>
                <nav class={styles.tabs} aria-label="Result type">
                    <For each={TABS}>
                        {tab => (
                            <a
                                class={styles.tab}
                                href={hrefFor({ type: tab.type })}
                                aria-current={type() === tab.type ? "page" : undefined}
                            >
                                {tab.label}
                            </a>
                        )}
                    </For>
                </nav>

                <Errored fallback={<p class={styles.status}>Search failed. Please try again.</p>}>
                    <Loading fallback={<ResultsSkeleton />}>
                        <Show when={results()}>
                            {data => (
                                <div class={[styles.results, { [styles.stale]: refreshing() }]}>
                                    <Show
                                        when={data().items.length > 0}
                                        fallback={
                                            <p class={styles.status}>
                                                {page() > 1 ? "No more results." : `Nothing found for “${query()}”.`}
                                            </p>
                                        }
                                    >
                                        <ul class={styles.list}>
                                            <Switch>
                                                <Match when={itemsOf(data(), "games")}>
                                                    {items => (
                                                        <For each={items()}>{game => <GameResult game={game} />}</For>
                                                    )}
                                                </Match>
                                                <Match when={itemsOf(data(), "posts")}>
                                                    {items => (
                                                        <For each={items()}>{post => <PostResult post={post} />}</For>
                                                    )}
                                                </Match>
                                                <Match when={itemsOf(data(), "squads")}>
                                                    {items => (
                                                        <For each={items()}>{squad => <LfgResult squad={squad} />}</For>
                                                    )}
                                                </Match>
                                            </Switch>
                                        </ul>
                                    </Show>

                                    <nav class={styles.pagination} aria-label="Pagination">
                                        <Show when={page() > 1}>
                                            <a class="button secondary" href={hrefFor({ page: page() - 1 })} rel="prev">
                                                ← Previous
                                            </a>
                                        </Show>
                                        <span class={styles.pageNumber}>Page {page()}</span>
                                        {/* a full page means there may be another one */}
                                        <Show when={data().items.length === PAGE_SIZE && page() < MAX_PAGE}>
                                            <a class="button secondary" href={hrefFor({ page: page() + 1 })} rel="next">
                                                Next →
                                            </a>
                                        </Show>
                                    </nav>
                                </div>
                            )}
                        </Show>
                    </Loading>
                </Errored>
            </Show>
        </main>
    )
}

// ── Result rows ──

type GameItem = Extract<Result, { type: "games" }>["items"][number]
type PostItem = Extract<Result, { type: "posts" }>["items"][number]
type SquadItem = Extract<Result, { type: "squads" }>["items"][number]

function GameResult(props: { game: GameItem }) {
    return (
        <li>
            <a class={["card", styles.result]} href={`/games/${props.game.gameId}`}>
                <img
                    class={["cutout", styles.cover]}
                    src={mediaSrc(props.game.cover)}
                    alt=""
                    width="48"
                    height="64"
                    loading="lazy"
                />
                <span class={styles.text}>
                    <span class={styles.primary}>{props.game.title}</span>
                    <span class={styles.secondary}>{props.game.releaseDate.slice(0, 4)}</span>
                </span>
            </a>
        </li>
    )
}

function PostResult(props: { post: PostItem }) {
    const created = () => new Date(props.post.createdAt)

    return (
        <li>
            <a class={["card", styles.result]} href={`/posts/${props.post.postId}`}>
                <img
                    class={["cutout", styles.avatar]}
                    src={mediaSrc(props.post.author.image)}
                    alt=""
                    width="40"
                    height="40"
                    loading="lazy"
                />
                <span class={styles.text}>
                    <span class={styles.primary}>{props.post.title}</span>
                    <span class={styles.secondary}>
                        @{props.post.author.username} ·{" "}
                        <time datetime={created().toISOString()}>{dateFormat.format(created())}</time>
                    </span>
                </span>
            </a>
        </li>
    )
}

function LfgResult(props: { squad: SquadItem }) {
    const created = () => new Date(props.squad.createdAt)

    return (
        <li>
            <a class={["card", styles.result]} href={paths.squads(props.squad.squadId)}>
                <img
                    class={["cutout", styles.avatar]}
                    src={mediaSrc(props.squad.creator.image)}
                    alt=""
                    width="40"
                    height="40"
                    loading="lazy"
                />
                <span class={styles.text}>
                    <span class={styles.primary}>{props.squad.game?.title ?? "Looking for group"}</span>
                    <Show when={props.squad.text}>
                        <span class={styles.excerpt}>{props.squad.text}</span>
                    </Show>
                    <span class={styles.secondary}>
                        @{props.squad.creator.username} ·{" "}
                        <time datetime={created().toISOString()}>{dateFormat.format(created())}</time>
                    </span>
                </span>
            </a>
        </li>
    )
}

function ResultsSkeleton() {
    return (
        <div class={styles.list} role="status" aria-label="Loading results">
            <For each={[0, 1, 2, 3]} keyed={false}>{() => <Bone width="100%" height="5.5rem" />}</For>
        </div>
    )
}