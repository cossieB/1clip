import { House, Dice5, BriefcaseBusiness, Code, Menu } from "lucide-solid";
import styles from "./MainLayout.module.css"
import type { JSXElement } from "solid-js";
import { Link } from "@tanstack/solid-router";

export function Nav(props: {toggleNav(): void}) {

    return (
        <nav class={styles.nav} >
            <div class={styles.topItem}>
                <button class={styles.toggleBtn} onclick={props.toggleNav}>
                    <Menu />
                </button>
                <aside>
                    GG
                </aside>
            </div>
            <ul>
                <NavItem
                    href="/"
                    label="Home"
                    icon={<House />}
                />
                <NavItem
                    href="/games"
                    label="Games"
                    icon={<Dice5 />}
                />
                <NavItem
                    href="/developers"
                    label="Developers"
                    icon={<Code />}
                />
                <NavItem
                    href="/publishers"
                    label="Publishers"
                    icon={<BriefcaseBusiness />}
                />
            </ul>
        </nav>
    )
}

type NavItemProps = {
    label: string
    icon: JSXElement
    href: string
}

function NavItem(props: NavItemProps) {
    return (
        <Link to={props.href} activeProps={{class: styles.active}} >
            <li class={`${styles.navItem}`}>
                {props.icon}
                <span> {props.label} </span>
            </li>
        </Link>
    )
}