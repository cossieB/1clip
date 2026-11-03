import { type Element, Loading, Show } from "solid-js"
import { session } from "../authApi"

type Props = {
    fallback?: Element
    children: Element
}

export function ShowWhenAuthed(props: Props) {

    return (
        <Loading>
            <Show when={session().data} fallback={props.fallback}>
                {props.children}
            </Show>
        </Loading>
    )
}