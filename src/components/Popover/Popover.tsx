import type { JSXElement } from "solid-js";
import styles from "./Popover.module.css"

export function Popover(props: {children: JSXElement}) {
    return (
        <div class={styles.popover} popover id="autoPopover">
            {props.children}
        </div>
    )
}