import { createSignal } from "solid-js"
import styles from "./TagsInput.module.css"
import { PlusIcon } from "lucide-solid"

type P = {
    arr: string[]
    /**Callback to run when user types comma, semi-colon or clicks the plus button. Throw an error in the caller when val fails validation */
    onAdd: (val: string) => void
    label: string
    disabled: boolean
}

export function InputWithPlusBtn(props: P) {
    let inputEl!: HTMLInputElement
    const [input, setInput] = createSignal("")

    function handleInput(e: InputEvent & {
        currentTarget: HTMLInputElement;
        target: HTMLInputElement;
    }) {
        e.preventDefault()
        if (/[,;]$/.test(e.currentTarget.value)) {
            e.preventDefault()
            const val = e.currentTarget.value.slice(0, -1).trim();
            try {
                props.onAdd(val)
                e.currentTarget.value = ""
                setInput("")
            } 
            catch (error) {
                setInput(val);
                e.currentTarget.value = val
            }
        }
        else {
            setInput(e.currentTarget.value);
        }
    }
    return (
        <div
            class={`${styles.tags}`}
            onkeypress={e => {
                if (e.key == "Enter") {
                    e.preventDefault();
                    props.onAdd(input().trim())
                }
            }}
        >

            <input
                ref={inputEl}
                value={input()}
                oninput={handleInput}
                type="text"
                placeholder={props.label}
                disabled={props.disabled}
            />
            <button
                class={styles.addBtn}
                type="button"
                disabled={props.disabled || input().length == 0}
                onclick={() => {
                    props.onAdd(input().trim());
                    setInput("")
                }}
            >
                <PlusIcon />
            </button>
        </div>
    )
}