import { ComponentProps, JSXElement, splitProps } from "solid-js"
import { Require } from "~/lib/utilityTypes"
import styles from "./MainLayout.module.css"
import { A } from "@solidjs/router"

type NavItemProps = {
    label: string
    icon: JSXElement
} & ComponentProps<typeof A>

export function NavItem(props: NavItemProps) {
    const [_, toProps] = splitProps(props, ["label", "icon"])
    return (
        <A {...toProps} activeClass={ styles.active} end>
            <li class={`${styles.navItem}`}>
                {props.icon}
                <span> {props.label} </span>
            </li>
        </A>
    )
}