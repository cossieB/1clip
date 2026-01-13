import { Link, LinkComponentProps } from "@tanstack/solid-router"
import { JSXElement, splitProps } from "solid-js"
import { Require } from "~/lib/utilityTypes"
import styles from "./MainLayout.module.css"

type NavItemProps = {
    label: string
    icon: JSXElement
} & Require<LinkComponentProps, 'to'>

export function NavItem(props: NavItemProps) {
    const [_, toProps] = splitProps(props, ["label", "icon"])
    return (
        <Link {...toProps} activeProps={{ class: styles.active }} >
            <li class={`${styles.navItem}`}>
                {props.icon}
                <span> {props.label} </span>
            </li>
        </Link>
    )
}