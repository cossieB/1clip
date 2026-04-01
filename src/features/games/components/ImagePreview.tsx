import { InfoIcon, MinusIcon, PlusIcon, Trash2Icon } from "lucide-solid"
import { ComponentProps, Show, splitProps } from "solid-js"
import { RenderMedia } from "../../../components/RenderMedia"
import styles from "./GameForm.module.css"
import { Popover } from "~/components/Popover/Popover"
import { createStore } from "solid-js/store"

type Props = {
    url: string
    contentType: string
    metadata: Record<string, string>
    onDelete?(): void
    setMetadata?(metadata: Record<string, string>): void
} & ComponentProps<'div'>

export function ImagePreview(props: Props) {
    const [_, rest] = splitProps(props, ['url', 'onDelete', 'setMetadata', 'contentType', 'metadata'])
    return (
        <div {...rest}>
            <RenderMedia {...props} />
            <button
                class={styles.delBtn}
                type="button"
                onClick={props.onDelete}
            >
                <Trash2Icon size={16} />
            </button>
            <Show when={props.setMetadata}>
                <button
                    class={styles.metadataBtn}
                    type="button"
                    popoverTarget={props.url}
                >
                    <InfoIcon size={16} />
                </button>
                <Popover id={props.url}>
                    <MetadataEdit
                        metadata={props.metadata}
                        setMetadata={props.setMetadata!}
                    />
                </Popover>
            </Show>

        </div>
    )
}

type P = {
    metadata: Record<string, string>
    setMetadata(metadata: Record<string, string | undefined>): void
}

function MetadataEdit(props: P) {

    const [input, setInput] = createStore({
        key: "",
        value: ""
    })

    return (
        <div
            class={styles.metadataPopover}
        >            
            <div class={styles.inputs}>
                <input value="artist" type="text" disabled />
                <input type="text" value={props.metadata.artist} oninput={e => props.setMetadata({ ...props.metadata, artist: e.currentTarget.value || undefined })} />
            </div>
            <div class={styles.inputs}>
                <input value="title" type="text" disabled />
                <input type="text" value={props.metadata.title} oninput={e => props.setMetadata({ ...props.metadata, title: e.currentTarget.value || undefined })} />
            </div>

            <div class={styles.inputs}>
                <input type="text" placeholder="key" value={input.key} oninput={e => setInput({ key: e.currentTarget.value })} />
                <input type="text" placeholder="value" value={input.value} oninput={e => setInput({ value: e.currentTarget.value })} />
                <button
                    class={styles.btn}
                    disabled={!input.key || !input.value}
                    type="button"
                    onclick={() => {
                        props.setMetadata({ ...props.metadata, [input.key]: input.value || undefined })
                        setInput({
                            key: "",
                            value: ""
                        })
                    }}
                >
                    <PlusIcon size={12} />
                </button>
                <button
                    type="button"
                    class={`${styles.rmBtn} ${styles.btn}`}
                    disabled={!input.key}
                    onclick={() => {
                        props.setMetadata({ ...props.metadata, [input.key]: undefined })
                        setInput({
                            key: "",
                            value: ""
                        })
                    }}
                >
                    <MinusIcon size={12} />
                </button>
            </div>
            <pre>
                {JSON.stringify(props.metadata, null, 4)}
            </pre>
        </div>
    )
}