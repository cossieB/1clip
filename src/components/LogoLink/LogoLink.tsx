import { BriefcaseBusinessIcon, CodeIcon, GamepadIcon } from "lucide-solid"
import styles from "./LogoLink.module.css"
import { Link } from "@tanstack/solid-router"
import titleCase from "~/lib/titleCase"
import { Dynamic } from "solid-js/web"

type P = {
    item: {
        id: number,
        name: string,
        logo: string
    },
    className?: string,
    href: 'developer' | 'publisher' | 'platform'
}

const map = {
    developer: CodeIcon,
    publisher: BriefcaseBusinessIcon,
    platform: GamepadIcon,
}

export function LogoLink(props: P) {
    const icon = map[props.href]
    return (
        <div class={`${props.className} ${styles.logo}`} title={`${titleCase(props.href)}: ${props.item.name}`}>
            <Dynamic component={icon} />
            <img src={props.item.logo} alt="" />            
        </div>
    )
}