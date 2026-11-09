import { createMemo, createSignal, For, merge, onCleanup, Show, type Setter } from "solid-js"
import { formatBytes, matchesAccept } from "./fileUtils"
import styles from "./DropZone.module.css"
import { RenderMedia } from "../RenderMedia"

type Props = {
    files: File[]
    onAdd: (files: File[]) => void
    onRemove: (file: File) => void
    /** Same syntax as the native input: "image/*,.pdf" */
    accept?: string
    /** Defaults to unlimited */
    maxFiles?: number
    /** Max size per file, in bytes */
    maxSize?: number
    onReject?: (messages: string[]) => void
}

type DragState = "idle" | "over" | "invalid"

const sameFile = (a: File, b: File) =>
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified

export function DropZone(_props: Props) {
    const [dragState, setDragState] = createSignal<DragState>("idle")
    const [errors, setErrors] = createSignal<string[]>([])
    const props = merge({ maxFiles: 8, maxSize: 16 * 1024 * 1024 }, _props)

    const multiple = () => props.maxFiles !== 1

    const hint = createMemo(() => {
        const parts: string[] = []
        // if (props.accept) parts.push(props.accept.split(",").map(t => t.trim()).join(", "))
        parts.push(`max ${formatBytes(props.maxSize)} each`)
        if (Number.isFinite(props.maxFiles) && props.maxFiles > 1) parts.push(`up to ${props.maxFiles} files`)
        return parts.join(" · ")
    })

    const handleFiles = (list: FileList | null | undefined) => {
        if (!list || !list.length) return

        const rejected: string[] = []
        const valid: File[] = []

        for (const file of Array.from(list)) {
            if (!matchesAccept(file, props.accept)) {
                rejected.push(`${file.name}: file type not allowed`)
            }
            else if (file.size > props.maxSize) {
                rejected.push(`${file.name}: ${formatBytes(file.size)} exceeds ${formatBytes(props.maxSize)}`)
            }
            else {
                valid.push(file)
            }
        }

        if (!multiple()) {
            // Single mode: replace the current file with the first valid one
            if (valid.length) props.onAdd([valid[0]])
            if (valid.length > 1) rejected.push("Only one file is allowed")
        } else {
            const current = props.files
            const fresh = valid.filter(f => !current.some(c => sameFile(c, f)))
            const room = Math.max(0, props.maxFiles - current.length)
            const accepted = fresh.slice(0, room)

            if (fresh.length > room) {
                rejected.push(`Only ${props.maxFiles} files allowed; ${fresh.length - room} skipped`)
            }
            if (accepted.length) props.onAdd(accepted)
        }

        setErrors(rejected)
        if (rejected.length) props.onReject?.(rejected)
    }

    const removeFile = (file: File) => {
        setErrors([])
        props.onRemove(file)
    }

    return (
        <div class={styles.root}>
            <label
                class={[
                    styles["file-drop"],
                    {
                        [styles.dragover]: dragState() === "over",
                        [styles.invalid]: dragState() === "invalid"
                    }
                ]}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                    e.preventDefault()
                    setDragState("idle")
                    handleFiles(e.dataTransfer?.files)
                }}
            >
                <input
                    type="file"
                    accept={props.accept}
                    multiple={multiple()}
                    title=""
                    onChange={e => {
                        handleFiles(e.target.files)
                        e.target.value = ""
                    }}
                    onDragEnter={e => {
                        e.preventDefault()
                        const items = Array.from(e.dataTransfer?.items ?? []).filter(
                            item => item.kind === "file"
                        )
                        const ok =
                            items.length > 0 &&
                            items.every(item => matchesAccept({ name: "", type: item.type }, props.accept))
                        setDragState(ok ? "over" : "invalid")
                    }}
                    onDragLeave={e => {
                        e.preventDefault()
                        setDragState("idle")
                    }}
                />
                <span class={styles["file-title"]}>
                    {multiple() ? "Drop files here" : "Drop a file here"}
                </span>
                <Show when={hint()}>
                    <span class={styles["file-hint"]}>{hint()}</span>
                </Show>
            </label>

            <Show when={errors().length}>
                <ul class={styles.errors} role="alert">
                    <For each={errors()}>{message => <li>{message}</li>}</For>
                </ul>
            </Show>

            <Show when={props.files.length}>
                <ul class={styles.previews}>
                    <For each={props.files}>
                        {file => {
                            const url = /^(image\/|video\/|audio\/)/.test(file.type) 
                                ? URL.createObjectURL(file)
                                : undefined
                            onCleanup(() => url && URL.revokeObjectURL(url))

                            return (
                                <li class={styles.preview}>
                                    <Show
                                        when={url}
                                        fallback={
                                            <span class={styles.ext}>
                                                {file.name.split(".").pop()?.slice(0, 4) || "file"}
                                            </span>
                                        }
                                    >
                                        <RenderMedia
                                            contentType={file.type}
                                            url={url!}
                                        />
                                    </Show>
                                    <div class={styles.meta}>
                                        <span class={styles.name} title={file.name}>
                                            {file.name}
                                        </span>
                                        <span class={styles.size}>{formatBytes(file.size)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        class={styles.remove}
                                        aria-label={`Remove ${file.name}`}
                                        onClick={() => removeFile(file)}
                                    >
                                        ✕
                                    </button>
                                </li>
                            )
                        }}
                    </For>
                </ul>
            </Show>
        </div>
    )
}