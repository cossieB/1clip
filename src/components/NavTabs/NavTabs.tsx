import { Link, LinkComponentProps, useMatchRoute } from "@tanstack/solid-router"
import { createEffect, createSignal, For, splitProps } from "solid-js"
import { Require } from "~/lib/utilityTypes"
import styles from "./NavTabs.module.css"

type Props = {
    tabs: Array<Require<LinkComponentProps, 'to'> & { label: string }>
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
    const [div, linkProps] = splitProps(props, ['label', 'setIdx'])

    const matchRoute = useMatchRoute();
    const match = matchRoute({to: props.to})
    
    createEffect(() => {
        if (match())
            div.setIdx()
    })

    return (
        <div class={`${styles.tab} cutout`}>
            {div.label}
            <Link {...linkProps} search />
        </div>
    )
}