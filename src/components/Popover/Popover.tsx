import { type Element } from "solid-js";
import styles from "./Popover.module.css"

type NewType = {
    children: Element;
    id?: string
    ref?: HTMLDivElement | ((ref: HTMLDivElement) => void);
    popover?: "auto" | "manual" | "hint"
};

export function Popover(props: NewType) {
    return (
        <div
            ref={props.ref}
            class={styles.popover + " cutout"}
            popover={props.popover ?? "auto"}
            id={props.id ?? "autoPopover"}
        >
            {props.children}
        </div>
    )
}
