import { ComponentProps, Show, splitProps } from "solid-js";
import styles from "./Forms.module.css"

type Props = {
    isPending: boolean,
    disabled: boolean
}

export function SubmitBtn(props: Props & ComponentProps<"button">) {
    const [_, rest] = splitProps(props, ['isPending', 'disabled'])
    return (
        <button class={styles.btn} {...rest} disabled={props.isPending || props.disabled} type="submit" >
            <Show when={props.isPending} fallback={"Submit"}>
                <div class={styles.dot} style={{ "--delay": "0.5s" }} />
                <div class={styles.dot} style={{ "--delay": "1s" }} />
                <div class={styles.dot} style={{ "--delay": "1.5s" }} />
            </Show>
        </button>
    )
}