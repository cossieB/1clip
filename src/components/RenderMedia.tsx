import { Switch, Match } from "solid-js";

export function RenderMedia(props: { contentType: string, url: string, className?: string }) {
    return (
        <Switch>
            <Match when={props.contentType.startsWith("image")}>
                <img src={props.url} alt="" class={[props.className]} loading="lazy" />
            </Match>
            <Match when={props.contentType.startsWith("video")}>
                <video src={props.url} controls class={[props.className]}>
                    Your browser does not support playing videos.
                </video>
            </Match>
            <Match when={props.contentType.startsWith("audio")}>
                <audio controls src={props.url} class={[props.className]}>
                    Your browser does not support the audio element.
                </audio>
            </Match>
        </Switch>
    )
}