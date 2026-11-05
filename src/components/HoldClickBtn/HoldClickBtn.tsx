import { createSignal, Element, flush, omit, onCleanup } from "solid-js";
import styles from "./HoldClickBtn.module.css"
import { JSX } from "@solidjs/web/jsx-runtime";

type Props = {
    action: () => Promise<unknown>
    disabled?: boolean
    label: Element
    variant?: "danger"
} & Omit<JSX.HTMLAttributes<HTMLButtonElement>, 'style'> & {
    style?: JSX.CSSProperties
}

const holdTime = 1000

export function HoldClickBtn(props: Props) {
    const rest = omit(props, 'action', 'label', 'variant');
    const [time, setTime] = createSignal(0)
    const percentage = () => time() / holdTime * 100;
    let t: number | undefined;
    onCleanup(() => {
        clearInterval(t)
    })
    return (
        <button
            class={[styles.btn, rest.class]}
            data-type={props.variant}
            type="button"
            style={{
                ...(rest.style ?? {}),
                "--percent": percentage()
            }}
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