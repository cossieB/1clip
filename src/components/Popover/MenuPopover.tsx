import { ComponentProps, splitProps } from "solid-js";
import styles from "./MenuPopover.module.css"

export function MenuPopover(props: {id: string, popover?: "hint" | "auto" | "manual"} & ComponentProps<'div'>) {
    const [local, rest] = splitProps(props, ["popover"])
    return (
        <div {...rest} class={`${styles.menu} ${styles.class}`} popover={local.popover ?? "auto"} >{props.children}</div>
    )
}