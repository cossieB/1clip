import { InfoIcon, MinusIcon, PlusIcon, Trash2Icon } from "lucide-solid"
import { ComponentProps, createEffect, createSignal, For, Show, splitProps } from "solid-js"
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
    const [_, rest] = splitProps(props, ['url', 'onDelete', 'setMetadata'])
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

                    popoverTarget="autoPopover"
                    onclick={() => {

                    }}
                >
                    <InfoIcon size={16} />
                </button>
                <Popover>
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
    setMetadata(metadata: Record<string, string>): void
}

function MetadataEdit(props: P) {
    const [newMetadata, setNewMetadata] = createStore<Record<string, string>>({
        ...props.metadata,
    })

    createEffect(() => props.setMetadata(newMetadata))

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
                <input type="text" value={newMetadata.artist} oninput={e => setNewMetadata({ artist: e.currentTarget.value || undefined })} />
            </div>
            <div class={styles.inputs}>
                <input value="title" type="text" disabled />
                <input type="text" value={newMetadata.title} oninput={e => setNewMetadata({ title: e.currentTarget.value || undefined })} />
            </div>

            <div class={styles.inputs}>
                <input type="text" placeholder="key" value={input.key} oninput={e => setInput({ key: e.currentTarget.value })} />
                <input type="text" placeholder="value" value={input.value} oninput={e => setInput({ value: e.currentTarget.value })} />
                <button
                    class={styles.btn}
                    disabled={!input.key || !input.value}
                    type="button"
                    onclick={() => {
                        setNewMetadata({ [input.key]: input.value })
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
                        setNewMetadata({ [input.key]: undefined })
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
                {JSON.stringify(newMetadata, null, 4)}
            </pre>
        </div>
    )
}