import { PlusIcon, XIcon } from "lucide-solid";
import { type Accessor, createSignal, For, mergeProps, type Setter } from "solid-js"
import styles from "./TagsInput.module.css"

type Props = {
    tagLimit?: number
    tags: Accessor<string[]>
    setTags: Setter<string[]>
}

export function TagsInput(initialProps: Props) {
    const props = mergeProps({ tagLimit: Infinity }, initialProps)
    let inputEl!: HTMLInputElement
    const [input, setInput] = createSignal("")

    const isDisabled = () => props.tags().length >= props.tagLimit

    function addTag(val: string) {
        if (isDisabled()) return
        if (val.length == 0 || props.tags().includes(val)) return
        props.setTags(prev => [...prev, val])
        setInput("")
        inputEl.focus()
    }

    function handleInput(e: InputEvent & {
        currentTarget: HTMLInputElement;
        target: HTMLInputElement;
    }) {
        e.preventDefault()
        if (/[,;]$/.test(e.currentTarget.value)) {
            const val = e.currentTarget.value.slice(0, -1).trim();
            e.currentTarget.value = ""
            addTag(val)
        }
        else {
            setInput(e.currentTarget.value)
        }
    }

    return (
        <div
            class={`${styles.tags}`}
            onkeypress={e => {
                if (e.key == "Enter") {
                    e.preventDefault();
                    addTag(input().trim())
                }
            }}
        >
            <For each={props.tags()}>
                {tag => <Tag
                    tag={tag}
                    removeTag={() => props.setTags(prev => prev.filter(x => x != tag))}
                />}
            </For>
            <input
                ref={inputEl}
                value={input()}
                oninput={handleInput}
                type="text"
                placeholder="Add tag..."
                disabled={isDisabled()}
                maxLength={15}
            />
            <button
                class={styles.addBtn}
                type="button"
                disabled={isDisabled()}
                onclick={() => addTag(input().trim())}
            >
                <PlusIcon />
            </button>
        </div>
    )
}

type P = {
    tag: string,
    removeTag: () => void
}

function Tag(props: P) {
    return (
        <div class={styles.tag}>
            <span> {props.tag} </span>
            <button onclick={props.removeTag} type="button">
                <XIcon />
            </button>
        </div>
    )
}