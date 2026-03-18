import { CircleStopIcon, PlayIcon } from "lucide-solid"
import { createEffect, createSignal, onMount, Show } from "solid-js"
import { type getGameFn } from "~/serverFn/games"
import { STORAGE_DOMAIN } from "~/utils/env"
import styles from "./GamePage.module.css"

type Props = {
    media: Awaited<ReturnType<typeof getGameFn>>['media']
}

export function GameAudio(props: Props) {
    const song = () => props.media.find(m => m.contentType.startsWith("audio"))
    let audioRef!: HTMLAudioElement
    const [volume, setVolume] = createSignal(0.25)
    const [isPlaying, setIsPlaying] = createSignal(false)

    onMount(() => {
        setVolume(Number(localStorage.getItem("volume")) || 0.25)
    })

    createEffect(() => {
        audioRef.volume = volume()
    })

    return (
        <Show when={song()}>
            <audio
                ref={audioRef}
                src={STORAGE_DOMAIN + song()!.key}
                onVolumeChange={e => {
                    localStorage.setItem("volume", e.currentTarget.volume.toString())
                }}
                onPlaying={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                autoplay
                loop
            ></audio>
            <div class={styles.player} >
                <button
                    onclick={() => {
                        if (isPlaying())
                            audioRef.pause()
                        else
                            audioRef.play()
                    }}
                >
                    <Show when={isPlaying()}
                        fallback={<PlayIcon />}
                    >
                        <CircleStopIcon />                        
                    </Show>
                </button>
                <span class={styles.song}> {song()!.metadata.title} </span>
                <span class={styles.artist}> {song()!.metadata.artist} </span>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume()}
                    onChange={e => {
                        setVolume(Number(e.currentTarget.value))
                    }}
                />
            </div>
        </Show>
    )
}