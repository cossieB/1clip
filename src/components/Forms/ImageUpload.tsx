import { createSignal, onCleanup, Show, StoreSetter, type Setter } from "solid-js"
import { formatBytes } from "./fileUtils"
import styles from "./ImageUpload.module.css"
import { mediaSrc } from "~/utils/mediaSrc"

type Props = {
    setFile: (file: File) => void
    image?: string | null
    /** Max size in bytes */
    maxSize?: number
    onReject?: (message: string) => void
}

type DragState = "idle" | "over" | "invalid"

export function ImageUpload(props: Props) {
    const [objectUrl, setObjectUrl] = createSignal("")
    const [errored, setErrored] = createSignal(false)
    const [dragState, setDragState] = createSignal<DragState>("idle")
    const [error, setError] = createSignal("")

    onCleanup(() => URL.revokeObjectURL(objectUrl()))

    const src = () => {
        if (objectUrl()) return objectUrl()
        if (errored()) return undefined
        if (props.image) return props.image
    }

    const reject = (message: string) => {
        setError(message)
        props.onReject?.(message)
    }

    const handleFiles = (files: FileList | null | undefined) => {
        if (!files || !files.length) return

        const imageFile = Array.from(files).find(f => f.type.startsWith("image/"))

        if (!imageFile) {
            reject("Please choose an image file.")
            return
        }

        if (props.maxSize != null && imageFile.size > props.maxSize) {
            reject(`Image is too large (${formatBytes(imageFile.size)}). Max ${formatBytes(props.maxSize)}.`)
            return
        }

        setError("")
        URL.revokeObjectURL(objectUrl())
        setObjectUrl(URL.createObjectURL(imageFile))
        props.setFile(imageFile)
    }

    return (
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
                accept="image/*"
                title=""
                onChange={e => {
                    handleFiles(e.target.files)
                    e.target.value = ""
                }}
                onDragEnter={e => {
                    e.preventDefault()
                    const items = Array.from(e.dataTransfer?.items ?? [])
                    const hasImage = items.some(
                        item => item.kind === "file" && item.type.startsWith("image/")
                    )
                    setDragState(hasImage ? "over" : "invalid")
                }}
                onDragLeave={e => {
                    e.preventDefault()
                    setDragState("idle")
                }}
            />
            <Show
                when={src()}
                fallback={
                    <>
                        <span class={styles["file-title"]}>Drop an image here</span>
                        <Show when={props.maxSize != null}>
                            <span class={styles["file-hint"]}>
                                Max {formatBytes(props.maxSize!)}
                            </span>
                        </Show>
                    </>
                }
            >
                <img src={mediaSrc(src()!)} alt="" onError={() => setErrored(true)} />
            </Show>
            <Show when={error()}>
                <span class={styles["file-error"]} role="alert">
                    {error()}
                </span>
            </Show>
        </label>
    )
}