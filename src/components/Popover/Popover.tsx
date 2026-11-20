import {  merge, omit, type Element } from "solid-js";
import styles from "./Popover.module.css"
import { JSX } from "@solidjs/web/jsx-runtime";

type NewType = {
    children: Element;
    id?: string
    ref?: HTMLDivElement;
    popover?: "auto" | "manual" | "hint"
    variant: "centered" | "anchored"
} & JSX.HTMLAttributes<HTMLDivElement>

export function Popover(_props: NewType) {
    const props = omit(merge({
        popover: "auto",
        id: "autoPopover"
    } satisfies JSX.HTMLAttributes<HTMLDivElement>, _props), 'variant')
    
    return (
        <div
            {...props}
            ref={el => (props.ref = el)}
            class={["cutout", styles.popover, styles[_props.variant]]}
        >
            {props.children}
        </div>
    )
}
