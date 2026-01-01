import { createSignal, For, Match, Show, Switch } from "solid-js"
import styles from "./Carousel.module.css"
import { MoveLeftIcon, MoveRightIcon } from "lucide-solid"
import { useTouch } from "~/hooks/useTouch"

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
    const { handleTouchEnd, handleTouchStart } = useTouch({ onSwipeLeft: next, onSwipeRight: prev })
    return (
        <div
            data-func="carousel" class={styles.container}
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
                        <div>
                            <Switch>
                                <Match when={m.contentType.startsWith("image")}>
                                    <img src={m.url} alt="" />
                                </Match>
                                <Match when={m.contentType.startsWith("video")}>
                                    <video src={m.url}></video>
                                </Match>
                            </Switch>
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