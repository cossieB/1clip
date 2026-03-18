import { InfoIcon, PlusIcon, Trash2Icon } from "lucide-solid"
import { ComponentProps, createSignal, For, Show, splitProps } from "solid-js"
import { RenderMedia } from "../../../components/RenderMedia"
import styles from "./GameForm.module.css"
import { Popover } from "~/components/Popover/Popover"

type Props = {
    url: string
    contentType: string
    metadata: Record<string, string>
    onDelete?(): void
    setMetadata?(metadata: Record<string, string>): void
} & ComponentProps<'div'>

export function ImagePreview(props: Props) {
    const [_, rest] = splitProps(props, ['url', 'onDelete'])
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
    const [key, setKey] = createSignal("")
    const [value, setValue] = createSignal("")

    return (
        <div
            class={styles.metadataPopover}
        >
            <div class={styles.inputs}>
                <input type="text" value={key()} oninput={e => setKey(e.currentTarget.value)} />
                <input type="text" value={value()} oninput={e => setValue(e.currentTarget.value)} />
                <button
                    disabled={!key() || !value()}
                    type="button"
                    style={{ all: "unset", background: "red", padding: "0.25rem" }}
                    onclick={() => {
                        props.setMetadata({ ...props.metadata, [key()]: value() })
                        setKey("")
                        setValue("")
                    }}
                >
                    <PlusIcon size={16} />
                </button>
            </div>
            <div style={{ display: "grid", "grid-template-columns": "1fr 1fr" }}>

                <For each={Object.entries(props.metadata)}>
                    {entry =>
                        <>
                            <span> {entry[0]} </span>
                            <span> {entry[1]} </span>
                        </>
                    }
                </For>
            </div>
        </div>
    )
}