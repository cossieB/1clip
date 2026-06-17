import { BriefcaseBusinessIcon, CodeIcon, GamepadIcon } from "lucide-solid"
import styles from "./LogoLink.module.css"
import titleCase from "~/lib/titleCase"
import { Dynamic } from "solid-js/web"
import { A } from "@solidjs/router"

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
        <div class={`${props.className} ${styles.logo} cutout`} title={`${titleCase(props.href)}: ${props.item.name}`}>
            <Dynamic component={icon} />
            <img style={{"view-transition-name": `${props.href}${props.item.id}`}} src={props.item.logo} alt="" />   
            
            <A href={`/${props.href}s/${props.item.id}`} />         
        </div>
    )
}