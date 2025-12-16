import { createSignal, For, Show } from "solid-js"
import styles from "./Carousel.module.css"
import { MoveLeftIcon, MoveRightIcon } from "lucide-solid"

type Props = {
    showPrevBtn: boolean
    showNextBtn: boolean
    images: string[]
}

export function Carousel(props: Props) {

    const [idx, setIdx] = createSignal(0)
    function next() {
        setIdx(prev => (prev + 1) % props.images.length)
    }
    function prev() {
        if (idx() == 0)
            setIdx(props.images.length - 1)
        else
            setIdx(p => p - 1)
    }
    return (
        <div class={styles.container}>
            <div
                class={styles.carousel}
                style={{ "--idx": idx() }}
                classList={{ [styles.carousel]: true }}
            >
                <For each={props.images}>
                    {image => <div><img src={image} alt="" /></div>}
                </For>
                <Show when={props.showPrevBtn && props.images.length > 1}>
                    <button class={styles.navBtns} onclick={prev}>
                        <MoveLeftIcon />
                    </button>
                </Show>
                <Show when={props.showNextBtn && props.images.length > 1}>
                    <button class={styles.navBtns} onclick={next}>
                        <MoveRightIcon />
                    </button>
                </Show>
            </div>
            <div class={styles.notches}>
                <For each={props.images}>
                    {(_, i) =>
                        <button
                            onclick={() => setIdx(i())}
                            classList={{ [styles.active]: i() == idx() }}
                        />
                    }
                </For>
            </div>
        </div>
    )
}