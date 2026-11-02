import { Element, Loading, Show, useContext } from "solid-js"
import { AuthContext } from "./AuthContext"

type Props = {
    fallback?: Element
    children: Element
}

export function ShowWhenAuthed(props: Props) {
    const session = useContext(AuthContext)

    return (
        <Loading>
            <Show when={session().data} fallback={props.fallback}>
                {props.children}
            </Show>
        </Loading>
    )
}