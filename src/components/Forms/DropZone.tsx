import { createSignal, onCleanup, Setter, Show } from "solid-js";
import styles from "./DropZone.module.css"
import { mediaSrc } from "~/utils/mediaSrc";

type Props = {
    setFile: Setter<File | null>
    image?: string | null
}

export function DropZone(props: Props) {
    let ref!: HTMLLabelElement
    const [objectUrl, setObjectUrl] = createSignal("")
    const [errored, setErrored] = createSignal(false)
    onCleanup(() => URL.revokeObjectURL(objectUrl()));

    const src = () => {
        if (objectUrl())
            return objectUrl()
        if (errored())
            return undefined
        if (props.image)
            return props.image
    }

    const handleFiles = (files: FileList | null | undefined) => {
        if (!files || !files.length) return;

        const fileArray = Array.from(files);
        const imageFile = fileArray.find(f => f.type.startsWith("image/"));

        if (!imageFile) return;

        URL.revokeObjectURL(objectUrl());
        setObjectUrl(URL.createObjectURL(imageFile));
        props.setFile(imageFile);
    };

    return (
        <label
            ref={ref}
            class={styles["file-drop"]}
            onDragOver={e => e.preventDefault()}

            onDrop={async e => {
                e.preventDefault()
                ref.classList.remove(styles.invalid, styles.dragover)
                handleFiles(e.dataTransfer?.files)
            }}
        >
            <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={e => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                }}
                title=""
                onDragEnter={e => {
                    e.preventDefault();
                    const items = Array.from(e.dataTransfer?.items ?? []);
                    const hasImage = items.some(item => {
                        const isLocalImage = item.kind === 'file' && item.type.startsWith('image/');
                        const isExternalImage = item.kind === 'string' && (item.type === 'text/html' || item.type === 'text/uri-list');
                        return isLocalImage || isExternalImage;
                    });

                    if (hasImage) {
                        ref.classList.remove(styles.invalid);
                        ref.classList.add(styles.dragover);
                    }
                    else {
                        ref.classList.remove(styles.dragover);
                        ref.classList.add(styles.invalid);
                    }
                }}

                onDragLeave={e => {
                    e.preventDefault()
                    ref.classList.remove(styles.dragover, styles.invalid)
                }}
            />
            <Show when={src()}
                fallback={<span class={styles["file-title"]}>Drop files here</span>}
            >
                <img
                    src={mediaSrc(src()!)}
                    alt=""
                    onError={() => setErrored(true)}
                />
            </Show>
        </label>
    )
}