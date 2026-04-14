import { ComponentProps, createEffect, createSignal, Show, type JSXElement } from "solid-js";
import styles from "./Popover.module.css"
import { StandaloneInput } from "../Forms/FormInput";

type NewType = {
    children: JSXElement;
    id?: string
    ref?: HTMLDivElement | ((ref: HTMLDivElement) => void);
    popover?: "auto" | "manual" | "hint"
};

export function Popover(props: NewType) {
    return (
        <div
            ref={props.ref}
            class={styles.popover + " cutout"}
            //@ts-expect-error popover="hint" is valid.
            popover={props.popover ?? "auto"}
            id={props.id ?? "autoPopover"}
        >
            {props.children}
        </div>
    )
}
