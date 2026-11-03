import { createSignal, Element, flush, onCleanup } from "solid-js";
import styles from "./HoldClickBtn.module.css"

type Props = {
    action: () => Promise<unknown>
    disabled?: boolean
    label: Element
    type?: "danger"
}

const holdTime = 1000

export function HoldClickBtn(props: Props) {
    const [time, setTime] = createSignal(0)
    const percentage = () => time() / holdTime * 100;
    let t: number | undefined;
    onCleanup(() => {
        clearInterval(t)
    })
    return (
        <button
            class={styles.btn}
            disabled={props.disabled}
            data-type={props.type}
            type="button"
            style={{ "--percent": percentage() }}
            onMouseDown={e => {
                t = window.setInterval(async () => {
                    if (time() < holdTime) 
                        return setTime(prev => prev + 25)

                    clearInterval(t)
                    t = undefined;
                    setTime(0)
                    await props.action()
                }, 25)
            }}
            onMouseUp={e => {
                window.clearInterval(t)
                t = undefined;
                setTime(0)
            }}
        >
            <span>
                {props.label}
            </span>
        </button>
    )
}