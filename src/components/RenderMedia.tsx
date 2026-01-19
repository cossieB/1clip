import { Switch, Match } from "solid-js";

export function RenderMedia(props: { contentType: string, url: string }) {
    return (
        <Switch>
            <Match when={props.contentType.startsWith("image")}>
                <img src={props.url} alt="" />
            </Match>
            <Match when={props.contentType.startsWith("video")}>
                <video src={props.url} controls>
                    Your browser does not support playing videos.
                </video>
            </Match>
            <Match when={props.contentType.startsWith("audio")}>
                <audio src={props.url}>
                    Your browser does not support the audio element.
                </audio>
            </Match>
        </Switch>
    )
}