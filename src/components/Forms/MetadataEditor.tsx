import { createMemo, createStore, For, onSettled, Show, untrack } from "solid-js"
import styles from "./MetadataEditor.module.css"

export type Metadata = Record<string, string>

type Props = {
    title: string
    initial?: Metadata
    onSave: (metadata: Metadata) => void
    onClose: () => void
}

type Row = { id: number; key: string; value: string }

const PRESETS = [
    { key: "alt", label: "Alt", placeholder: "Describe the image, e.g. Boss fight, phase 2" },
    { key: "title", label: "Title", placeholder: "e.g. Final boss" },
    { key: "artist", label: "Artist", placeholder: "e.g. Jane Doe" },
] as const

const PRESET_KEYS: ReadonlySet<string> = new Set(PRESETS.map(p => p.key))

const MAX_KEY = 40
const MAX_VALUE = 200
let nextId = 0
const blank = (): Row => ({ id: nextId++, key: "", value: "" })

export function MetadataEditor(props: Props) {
    let dialog!: HTMLDialogElement

    // Split the incoming metadata into preset values and custom rows
    const initial = untrack(() => props.initial ?? {})

    const [presets, setPresets] = createStore<Record<string, string>>(() =>
        Object.fromEntries(PRESETS.map(p => [p.key, initial[p.key] ?? ""]))
    )

    const [rows, setRows] = createStore<Row[]>(
        Object.entries(initial)
            .filter(([key]) => !PRESET_KEYS.has(key))
            .map(([key, value]) => ({ id: nextId++, key, value }))
    )

    onSettled(() => dialog.showModal())

    const setPreset = (key: string, value: string) =>
        setPresets(p => {
            p[key] = value
        })

    const update = (id: number, patch: Partial<Row>) =>
        setRows(rs => {
            const item = rs.find(r => r.id == id)
            if (item) {
                patch.key && (item.key = patch.key)
                patch.value && (item.value = patch.value)
            }
        })

    const remove = (id: number) =>
        setRows(rs => rs.filter(r => r.id !== id))

    // Custom keys can't repeat each other or shadow a preset
    const duplicates = createMemo(() => {
        const seen = new Set<string>(PRESET_KEYS)
        const dupes = new Set<string>()
        for (const { key } of rows) {
            const k = key.trim()
            if (!k) continue
            if (seen.has(k)) dupes.add(k)
            seen.add(k)
        }
        return dupes
    })

    const save = (e: SubmitEvent) => {
        e.preventDefault()
        if (duplicates().size) return

        const out: Metadata = {}
        for (const { key } of PRESETS) {
            const v = presets[key].trim()
            if (v) out[key] = v
        }
        for (const { key, value } of rows) {
            const k = key.trim()
            if (k) out[k] = value.trim()
        }
        props.onSave(out)
        dialog.close()
    }

    return (
        <dialog
            ref={dialog}
            class={styles.dialog}
            aria-labelledby="meta-title"
            onClose={() => props.onClose()}
            // click on the backdrop (the dialog element itself) closes it
            onClick={e => e.target === dialog && dialog.close()}
        >
            <form class={[styles.form, "form"]} onSubmit={save}>
                <header class={styles.header}>
                    <h2 id="meta-title">Metadata</h2>
                    <span class={styles.filename} title={props.title}>{props.title}</span>
                </header>

                
                    <For each={PRESETS}>
                        {preset => (
                            <div class="field">
                                <label>{preset.label}</label>
                                <input
                                    value={presets[preset.key]}
                                    maxlength={MAX_VALUE}
                                    placeholder={preset.placeholder}
                                    onInput={e => setPreset(preset.key, e.currentTarget.value)}
                                />
                            </div>
                        )}
                    </For>
                

                <Show when={rows.length}>
                    <h2 class={styles.subheading}>Custom fields</h2>
                    <ul class={styles.rows}>
                        <For each={rows}>
                            {row => (
                                <li class={styles.row}>
                                    <div class="field">
                                        <label>Key</label>
                                        <input
                                            value={row.key}
                                            maxlength={MAX_KEY}
                                            placeholder="e.g. source"
                                            onInput={e => update(row.id, { key: e.currentTarget.value })}
                                        />
                                    </div>
                                    <div class="field">
                                        <label>Value</label>
                                        <input
                                            value={row.value}
                                            maxlength={MAX_VALUE}
                                            onInput={e => update(row.id, { value: e.currentTarget.value })}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        class="ghost"
                                        aria-label="Remove field"
                                        onClick={() => remove(row.id)}
                                    >
                                        ✕
                                    </button>
                                </li>
                            )}
                        </For>
                    </ul>
                </Show>

                <Show when={duplicates().size}>
                    <p class={styles.error} role="alert">
                        Duplicate keys: {[...duplicates()].join(", ")}
                    </p>
                </Show>

                <button type="button" class="secondary" onClick={() => setRows(rs => [...rs, blank()])}>
                    + Add custom field
                </button>

                <footer class={styles.actions}>
                    <button type="button" class="ghost" onClick={() => dialog.close()}>Cancel</button>
                    <button type="submit" class="primary" disabled={duplicates().size > 0}>Save</button>
                </footer>
            </form>
        </dialog>
    )
}