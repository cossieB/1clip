import { For, onSettled, useContext } from "solid-js"
import errorWavSrc from "./error.mp3"
import infoWavSrc from "./info.mp3"
import warningWavSrc from "./warning.mp3"
import { ToastContext, type TToast } from "./ToastProvider"
import styles from "./Toast.module.css"
import { XIcon } from "@lucide/solid"

export function ToastContainer() {
    const { toasts } = useContext(ToastContext)
    
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
    const { removeToast } = useContext(ToastContext)

    function close () {
        ref.hidePopover()
        removeToast(props.i)
    }

    onSettled(() => {
        ref.showPopover()
        const audio = props.toast.type == "error" ? errorAudio : props.toast.type == "warning"? warningAudio : infoAudio
        audio.play()
        let id: number;
        if (props.toast.autoFades)
            id = window.setTimeout(close, 5000)
        return () => {
            clearTimeout(id)
        }
    })
    return (
        <div
            class={`${styles.toast} ${styles[props.toast.type]} cutout`}
            ref={el => (ref = el)}
            popover="manual"
            style={{ "--idx": props.i }}
        >
            <div>
                {props.toast.text}
                <button onClick={close}>
                    <XIcon />
                </button>
            </div>
        </div>
    )
}