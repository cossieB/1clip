// Skeletons.tsx
import { For, merge, Repeat, Show } from "solid-js"
import styles from "./Skeletons.module.css"

type BoneProps = {
    width?: string
    height?: string
    class?: string[]
}

/** A single shimmering placeholder shape. */
export function Bone(_props: BoneProps) {
    const props = merge({class: [] as string[]}, _props)
    return (
        <span
            aria-hidden="true"
            class={[styles.bone, ...props.class]}
            style={{ width: props.width, height: props.height }}
        />
    )
}

function Lines(props: { widths: string[] }) {
    return (
        <div class={styles.lines}>
            <For each={props.widths} keyed={false}>
                {width => <Bone width={width()} height="1rem" />}
            </For>
        </div>
    )
}

export function PostSkeleton(props: { media?: boolean }) {
    return (
        <article class={["card", styles.card, styles.post]} role="status" aria-label="Loading post">
            <header class={styles.header}>
                <div class={styles.person}>
                    <Bone class={["cutout", styles.bevelMd]} width="2.5rem" height="2.5rem" />
                    <div class={styles.stack}>
                        <Bone width="7rem" height=".9rem" />
                        <Bone width="5rem" height=".7rem" />
                    </div>
                </div>
                <Bone width="5rem" height="1.4rem" />
            </header>

            <Bone width="55%" height="1.3rem" />
            <Lines widths={["100%", "96%", "62%"]} />

            <Show when={props.media}>
                <Bone class={[styles.media]} width="100%" />
            </Show>

            <footer class={styles.footer}>
                <div class={styles.actions}>
                    <Bone width="4.5rem" height="2.2rem" />
                    <Bone width="4.5rem" height="2.2rem" />
                </div>
                <Bone width="5rem" height=".8rem" />
            </footer>
        </article>
    )
}

export function CommentSkeleton() {
    return (
        <article class={styles.comment} role="status" aria-label="Loading comment">
            <Bone class={["cutout", styles.bevelSm]} width="2rem" height="2rem" />
            <div class={styles.commentBody}>
                <div class={styles.inline}>
                    <Bone width="6rem" height=".9rem" />
                    <Bone width="4rem" height=".7rem" />
                </div>
                <Lines widths={["100%", "68%"]} />
                <div class={styles.actions}>
                    <Repeat count={3}>{() => <Bone width="3.25rem" height="1.5rem" />}</Repeat>
                </div>
            </div>
        </article>
    )
}

export function LFGSkeleton() {
    return (
        <article class={["card", styles.card, styles.post]} role="status" aria-label="Loading looking-for-group post">
            <header class={styles.header}>
                <div class={styles.person}>
                    <Bone class={["cutout", styles.bevelMd]} width="2.5rem" height="2.5rem" />
                    <div class={styles.stack}>
                        <Bone width="7rem" height=".9rem" />
                        <Bone width="5rem" height=".7rem" />
                    </div>
                </div>
                <Bone width="3.5rem" height="1.4rem" />
            </header>

            <Bone width="50%" height="1.3rem" />
            <Lines widths={["100%", "74%"]} />

            <div class={styles.party}>
                <div class={styles.partyHeader}>
                    <Bone width="3rem" height=".7rem" />
                    <Bone width="5rem" height=".85rem" />
                </div>
                <div class={styles.pips}>
                    <Repeat count={4}>{() => <Bone width="1.75rem" height=".35rem" />}</Repeat>
                </div>
                <div class={styles.avatars}>
                    <Repeat count={3}>
                        {() => <Bone class={["cutout", styles.bevelXs]} width="1.75rem" height="1.75rem" />}
                    </Repeat>
                </div>
            </div>

            <footer class={styles.footer}>
                <div class={styles.actions}>
                    <Bone width="6rem" height="2.6rem" />
                    <Bone width="9rem" height="2.6rem" />
                </div>
            </footer>
        </article>
    )
}