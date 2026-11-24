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

const HOLD_TIME = 1000
const TICK_MS = 16

export function HoldClickBtn(props: Props) {
    const rest = omit(props, "action", "label", "variant", "disabled")
    const [elapsed, setElapsed] = createSignal(0)
    const percentage = () => Math.min((elapsed() / HOLD_TIME) * 100, 100)

    let intervalId: number | undefined
    let startTime = 0
    let triggered = false

    const stopHold = () => {
        if (intervalId !== undefined) {
            window.clearInterval(intervalId)
            intervalId = undefined
        }
        setElapsed(0)
    }

    const startHold = (e: PointerEvent & {
        currentTarget: HTMLButtonElement;
        target: Element;
    }) => {
        if (props.disabled) return
        // Ignore right-click on mouse
        if (e.pointerType === "mouse" && e.button !== 0) return

        stopHold()
        triggered = false
        startTime = performance.now()

        try {
            e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
            // Ignore if pointer capture isn't supported for the event
        }

        intervalId = window.setInterval(async () => {
            const diff = performance.now() - startTime
            if (diff < HOLD_TIME) {
                setElapsed(diff)
                return
            }

            if (triggered) return
            triggered = true
            stopHold()
            await props.action()
        }, TICK_MS)
    }

    onCleanup(stopHold)

    return (
        <button
            {...rest}
            disabled={props.disabled}
            class={[styles.btn, rest.class]}
            data-variant={props.variant}
            type="button"
            style={{
                ...(rest.style ?? {}),
                "--percent": percentage(),
            }}
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerCancel={stopHold}
        >
            <span>{props.label}</span>
        </button>
    )
}