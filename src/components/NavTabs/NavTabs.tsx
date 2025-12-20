import { Link, LinkComponentProps } from "@tanstack/solid-router"
import { createSignal, For, splitProps } from "solid-js"
import { Require } from "~/lib/utilityTypes"
import styles from "./NavTabs.module.css"

type Props = {
    tabs: Array<Require<LinkComponentProps, 'to'> & {label: string}>
}

export function NavTabs(props: Props) {
    const [i, setI] = createSignal(0)
    return (
        <nav class={styles.nav} style={{"--count": props.tabs.length, "--i": i()}}>
            <For each={props.tabs}>
                {(tab, i) =>
                    <Tab
                        {...tab}
                        onclick={() => setI(i())}
                    />
                }
            </For>
        </nav>
    )
}

function Tab(props: Props["tabs"][number] & {onclick(): void}) {
    const [div, linkProps] = splitProps(props, ['label', 'onclick'])
    return (
        <div class={styles.tab} onclick={div.onclick}>
            {div.label}
            <Link 
                {...linkProps} 
                />
        </div>
    )
}