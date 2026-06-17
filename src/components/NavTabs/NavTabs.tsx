import { ComponentProps, createEffect, createSignal, For, splitProps } from "solid-js"
import styles from "./NavTabs.module.css"
import { A, useMatch } from "@solidjs/router"

type Props = {
    tabs: Array<ComponentProps<typeof A> & {label: string}>
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

    const match = useMatch(() => props.href);
    
    
    createEffect(() => {
        if (match())
            div.setIdx()
    })

    return (
        <div class={`${styles.tab} cutout`}>
            {div.label}
            <A {...linkProps} />
        </div>
    )
}