import { ComponentProps, createEffect, createSignal, For, omit } from "solid-js"
import styles from "./NavTabs.module.css"
import { useLocation, useMatch } from "@solidjs/router"
import { JSX } from "@solidjs/web/jsx-runtime"

type Props = {
    tabs: {
        label: string
        href: string
    }[]
}

export function NavTabs(props: Props) {
    const [i, setI] = createSignal(0)
    return (
        <nav class={styles.nav} style={{ "--count": props.tabs.length, "--i": i() }}>
            <For each={props.tabs}>
                {(tab, i) =>
                    <Tab
                        {...tab}
                        setIdx={() => setI(i())}
                    />
                }
            </For>
        </nav>
    )
}

function Tab(props: Props["tabs"][number] & { setIdx(): void }) {
    
    const match = useMatch(() => props.href);
    const location = useLocation()
    
    createEffect(match, (m) => {
        if (m) props.setIdx()
    })  

    return (
        <div class={styles.tab} >
            <a  href={props.href + location.search} >{props.label}</a>
        </div>
    )
}