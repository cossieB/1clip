import { createEffect, createSignal, onSettled, Show } from "solid-js";
import styles from "./AudioPlayer.module.css";
import { mediaSrc } from "~/utils/mediaSrc";

const VOLUME_KEY = "volume";

type AudioPlayerProps = {
    key: string;
    contentType: string;
    metadata: Record<string, string>;
};

function readStoredVolume(): number {
    try {
        const raw = localStorage.getItem(VOLUME_KEY);
        if (raw === null) return 1;
        const value = Number(raw);
        return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
    } catch {
        return 1;
    }
}

function storeVolume(value: number) {
    try {
        localStorage.setItem(VOLUME_KEY, String(value));
    } catch {
        // storage unavailable (private mode, quota); ignore
    }
}

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = String(total % 60).padStart(2, "0");
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function AudioPlayer(props: {audio: AudioPlayerProps}) {
    let audio!: HTMLAudioElement;

    const [playing, setPlaying] = createSignal(false);
    const [current, setCurrent] = createSignal(0);
    const [duration, setDuration] = createSignal(0);
    const [volume, setVolume] = createSignal(1);
    const [muted, setMuted] = createSignal(false);

    const title = () => props.audio.metadata?.title || props.audio.key.split("/").pop() || "Untitled";
    const artist = () => props.audio.metadata?.artist;

    const seekPercent = () => (duration() > 0 ? (current() / duration()) * 100 : 0);
    const volumePercent = () => (muted() ? 0 : volume() * 100);

    // Browser-only: read the saved volume after mount so SSR/hydration markup matches
    onSettled(() => {
        setVolume(readStoredVolume());
    });

    // Keep the element in sync with state
    createEffect(
        () => ({ volume: volume(), muted: muted() }),
        ({ volume, muted }) => {
            audio.volume = volume;
            audio.muted = muted;
        }
    );

    const toggle = () => {
        if (audio.paused) {
            audio.play().catch(() => setPlaying(false));
        } else {
            audio.pause();
        }
    };

    const onSeek = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
        const value = Number(e.currentTarget.value);
        audio.currentTime = value;
        setCurrent(value);
    };

    const onVolume = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
        const value = Number(e.currentTarget.value);
        setVolume(value);
        setMuted(value === 0);
        storeVolume(value);
    };

    return (
        <div class={`card ${styles.player}`}>
            <audio
                ref={audio}
                src={mediaSrc(props.audio.key)}
                preload="metadata"
                onLoadedMetadata={() => setDuration(audio.duration)}
                onDurationChange={() => setDuration(audio.duration)}
                onTimeUpdate={() => setCurrent(audio.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
            />

            <div class={styles.header}>
                <button
                    type="button"
                    class={`primary ${styles.play}`}
                    onClick={toggle}
                    aria-label={playing() ? "Pause" : "Play"}
                >
                    <Show
                        when={playing()}
                        fallback={
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M7 4v16l13-8z" fill="currentColor" />
                            </svg>
                        }
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" />
                        </svg>
                    </Show>
                </button>

                <div class={styles.meta}>
                    <span class={styles.title} title={title()}>{title()}</span>
                    <Show when={artist()}>
                        <span class={styles.artist}>{artist()}</span>
                    </Show>
                </div>
            </div>

            <div class={styles.seekRow}>
                <span class={styles.time}>{formatTime(current())}</span>
                <input
                    type="range"
                    min="0"
                    max={duration() || 0}
                    step="0.1"
                    value={current()}
                    disabled={!duration()}
                    style={{ "--fill": `${seekPercent()}%` }}
                    onInput={onSeek}
                    aria-label="Seek"
                />
                <span class={styles.time}>{formatTime(duration())}</span>
            </div>

            <div class={styles.volumeRow}>
                <button
                    type="button"
                    class={`ghost ${styles.mute}`}
                    onClick={() => setMuted(!muted())}
                    aria-label={muted() ? "Unmute" : "Mute"}
                    aria-pressed={muted() ? "true" : "false"}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 9v6h4l5 4V5L7 9z" fill="currentColor" />
                        <Show
                            when={!muted() && volume() > 0}
                            fallback={
                                <path
                                    d="M16 9l5 6M21 9l-5 6"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    fill="none"
                                />
                            }
                        >
                            <path
                                d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
                                stroke="currentColor"
                                stroke-width="2"
                                fill="none"
                            />
                        </Show>
                    </svg>
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={muted() ? 0 : volume()}
                    style={{ "--fill": `${volumePercent()}%` }}
                    onInput={onVolume}
                    aria-label="Volume"
                />
            </div>
        </div>
    );
}