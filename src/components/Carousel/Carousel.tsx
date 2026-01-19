import { createSignal, For, Show } from "solid-js"
import { MoveLeftIcon, MoveRightIcon } from "lucide-solid"
import { getTouchHandlers } from "~/lib/getTouchHandlers"
import { RenderMedia } from "../RenderMedia"
import styles from "./Carousel.module.css"

type Props = {
    showPrevBtn: boolean
    showNextBtn: boolean
    media: { url: string, contentType: string }[]
}

export function Carousel(props: Props) {

    const [idx, setIdx] = createSignal(0)
    function next() {
        setIdx(prev => (prev + 1) % props.media.length)
    }
    function prev() {
        if (idx() == 0)
            setIdx(props.media.length - 1)
        else
            setIdx(p => p - 1)
    }
    const { handleTouchEnd, handleTouchStart } = getTouchHandlers({ onSwipeLeft: next, onSwipeRight: prev })
    
    return (
        <div
            data-func="carousel"
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
        >
            <div
                class={styles.carousel}
                style={{ "--idx": idx() }}
                classList={{ [styles.carousel]: true }}
            >
                <For each={props.media}>
                    {m =>
                        <div class={styles.media}>
                            <RenderMedia {...m}/>
                        </div>}
                </For>
                <Show when={props.showPrevBtn && props.media.length > 1}>
                    <button class={styles.navBtns} onclick={prev}>
                        <MoveLeftIcon />
                    </button>
                </Show>
                <Show when={props.showNextBtn && props.media.length > 1}>
                    <button class={styles.navBtns} onclick={next}>
                        <MoveRightIcon />
                    </button>
                </Show>
            </div>
            <div class={styles.notches}>
                <For each={props.media}>
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