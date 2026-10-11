import { createUniqueId, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import styles from "./CharacterEditor.module.css"
import { RoleType } from "~/drizzle/models"
import { SearchAutocomplete } from "../SearchAutocomplete/SearchAutocomplete"
import { getGamesWithoutExtras } from "~/features/games/gamesApi"
import { getActorsFn, searchActorsFn } from "~/features/actors/actorsApi"

// `satisfies` guarantees every entry is a valid enum value (it can't tell you if you forgot one)
const ROLE_TYPES = ["player character", "major character", "minor character"] as const satisfies readonly RoleType[]
const DEFAULT_ROLE: RoleType = "major character" // matches the column default

const roleLabel = (role: RoleType) => role.charAt(0).toUpperCase() + role.slice(1)

type GameRef = { gameId: number, title: string }
type ActorRef = { actorId: number, name: string }

export type AppearanceRow = {
    /** Present for rows that already exist in the database, absent for rows added in this editor */
    appearanceId?: number
    gameId: number
    gameTitle: string
    actorId: number
    actorName: string
    character: string
    roleType: RoleType
}

type Props = (
    // On the edit game page: pass the game, search for actors to add
    | { game: GameRef, actor?: undefined }
    // On the edit actor page: pass the actor, search for games to add
    | { actor: ActorRef, game?: undefined }
) & {
    /** Existing appearances. Only read on mount; remount (e.g. with a key) to reseed after a save */
    appearances?: AppearanceRow[]
    /**
     * Called with the full list on every change. Rows without an `appearanceId` are new, and any initial
     * `appearanceId` missing from the list was deleted. `isValid` is false while any character name is blank.
     */
    onChange: (appearances: AppearanceRow[], isValid: boolean) => void
}

export function CharacterEditor(props: Props) {
    const titleId = createUniqueId()
    let rootRef!: HTMLDivElement

    // Copy so store updates never mutate the caller's objects
    const [rows, setRows] = createStore<AppearanceRow[]>((props.appearances ?? []).map((row) => ({ ...row })))

    const isGameEditor = () => props.game !== undefined
    const counterpartName = (row: AppearanceRow) => (isGameEditor() ? row.actorName : row.gameTitle)
    const isValid = () => rows.every((row) => row.character.trim() !== "")

    const emit = () => {
        const snapshot = rows.map((row) => ({ ...row, character: row.character.trim() }))
        props.onChange(snapshot, isValid())
    }

    const characterInputs = () => rootRef.querySelectorAll<HTMLInputElement>("[data-character-input]")

    const addRow = (row: AppearanceRow) => {
        // The search already hides added items, this is a safety net for the unique(gameId, actorId) constraint
        if (rows.some((existing) => existing.gameId === row.gameId && existing.actorId === row.actorId)) return

        setRows(rows.length, row)
        emit()
        // A character name is required, so jump straight to it
        queueMicrotask(() => [...characterInputs()].at(-1)?.focus())
    }

    const addActor = (actor: ActorRef) => {
        const game = props.game
        if (!game) return
        addRow({
            gameId: game.gameId,
            gameTitle: game.title,
            actorId: actor.actorId,
            actorName: actor.name,
            character: "",
            roleType: DEFAULT_ROLE
        })
    }

    const addGame = (game: GameRef) => {
        const actor = props.actor
        if (!actor) return
        addRow({
            gameId: game.gameId,
            gameTitle: game.title,
            actorId: actor.actorId,
            actorName: actor.name,
            character: "",
            roleType: DEFAULT_ROLE
        })
    }

    const remove = (index: number) => {
        setRows((current) => current.filter((_, i) => i !== index))
        emit()
        // Don't strand keyboard focus: move to the neighbouring row, or back to the search box
        queueMicrotask(() => {
            const inputs = characterInputs()
            const next = inputs[Math.min(index, inputs.length - 1)]
            ;(next ?? rootRef.querySelector<HTMLInputElement>('input[type="search"]'))?.focus()
        })
    }

    return (
        <div class={styles.root} ref={rootRef}>
            <div class={styles.header}>
                <h3 class={styles.title} id={titleId}>{isGameEditor() ? "Cast" : "Roles"}</h3>
                <span class={styles.count}>{rows.length}</span>
            </div>

            <Show
                when={isGameEditor()}
                fallback={
                    <SearchAutocomplete<GameRef>
                        label="Add a game"
                        placeholder="Search games to add"
                        noun="games"
                        queryKey="games"
                        search={(query, signal) => getGamesWithoutExtras({ data: query, signal })}
                        getLabel={(game) => game.title}
                        exclude={(game) => rows.some((row) => row.gameId === game.gameId)}
                        clearOnSelect
                        onSelect={addGame}
                    />
                }
            >
                <SearchAutocomplete<ActorRef>
                    label="Add an actor"
                    placeholder="Search actors to add"
                    noun="actors"
                    queryKey="actors"
                    search={(query, signal) => searchActorsFn({ data: query, signal })}
                    getLabel={(actor) => actor.name}
                    exclude={(actor) => rows.some((row) => row.actorId === actor.actorId)}
                    clearOnSelect
                    onSelect={addActor}
                />
            </Show>

            <Show
                when={rows.length > 0}
                fallback={
                    <p class={styles.empty}>
                        {isGameEditor() ? "No actors added to this game yet." : "This actor isn't credited in any games yet."}
                    </p>
                }
            >
                <div class={styles.table}>
                    <div class={styles.columnHeaders} aria-hidden="true">
                        <span>{isGameEditor() ? "Actor" : "Game"}</span>
                        <span>Character</span>
                        <span>Role</span>
                        <span />
                    </div>

                    <ul class={styles.list} aria-labelledby={titleId}>
                        <For each={rows}>
                            {(row, index) => (
                                <li class={styles.row}>
                                    <span class={styles.name} title={counterpartName(row)}>{counterpartName(row)}</span>

                                    <input
                                        class={`${styles.field} ${styles.character}`}
                                        data-character-input
                                        type="text"
                                        required
                                        placeholder="Character name"
                                        aria-label={`Character (${counterpartName(row)})`}
                                        value={row.character}
                                        onInput={(e) => {
                                            setRows(index(), "character", e.currentTarget.value)
                                            emit()
                                        }}
                                    />

                                    <select
                                        class={`${styles.field} ${styles.role}`}
                                        aria-label={`Role type (${counterpartName(row)})`}
                                        onChange={(e) => {
                                            setRows(index(), "roleType", e.currentTarget.value as RoleType)
                                            emit()
                                        }}
                                    >
                                        <For each={ROLE_TYPES}>
                                            {(role) => <option value={role} selected={row.roleType === role}>{roleLabel(role)}</option>}
                                        </For>
                                    </select>

                                    <button
                                        type="button"
                                        class={styles.remove}
                                        aria-label={`Remove ${counterpartName(row)}`}
                                        onClick={() => remove(index())}
                                    >
                                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
                                            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
                                        </svg>
                                    </button>
                                </li>
                            )}
                        </For>
                    </ul>
                </div>

                <Show when={!isValid()}>
                    <p class={styles.hint}>Every entry needs a character name.</p>
                </Show>
            </Show>
        </div>
    )
}