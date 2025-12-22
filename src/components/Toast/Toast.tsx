import { For, onCleanup, onMount } from "solid-js"
import { useToastContext } from "~/hooks/useToastContext"
import { type TToast } from "./ToastProvider"
import styles from "./Toast.module.css"
import errorWavSrc from "./error.mp3?url"
import infoWavSrc from "./info.mp3?url"
import warningWavSrc from "./warning.mp3?url"
import { XIcon } from "lucide-solid"

export function ToastContainer() {
    const { toasts } = useToastContext()
    
    return (
        <For each={toasts}>
            {(toast, i) =>
                <Toast
                    toast={toast}
                    i={i()}
                />
            }
        </For>
    )
}

export function Toast(props: { toast: TToast, i: number }) {
    let ref!: HTMLDivElement
    const errorAudio = new Audio(errorWavSrc)
    const infoAudio = new Audio(infoWavSrc)
    const warningAudio = new Audio(warningWavSrc)
    const { removeToast } = useToastContext()

    function close () {
        ref.hidePopover()
        removeToast(props.i)
    }

    onMount(() => {
        ref.showPopover()
        const audio = props.toast.type == "error" ? errorAudio : props.toast.type == "warning"? warningAudio : infoAudio
        audio.play()
        let id: number;
        if (props.toast.autoFades)
            id = window.setTimeout(close, 5000)
        onCleanup(() => {
            clearTimeout(id)
        })
    })
    return (
        <div
            class={`${styles.toast} ${styles[props.toast.type]} cutout`}
            ref={ref}
            popover="manual"
            style={{ "--idx": props.i }}
        >
            <div>
                {props.toast.text}
                <button onclick={close}>
                    <XIcon />
                </button>
            </div>
        </div>
    )
}