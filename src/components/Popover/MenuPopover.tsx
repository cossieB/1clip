import { ComponentProps } from "solid-js";
import styles from "./MenuPopover.module.css"

export function MenuPopover(props: {id: string} & ComponentProps<'div'>) {

    return (
        <div {...props} class={`${styles.menu} ${styles.class}`} popover="auto" />
    )
}