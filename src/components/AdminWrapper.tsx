import { Link } from "@tanstack/solid-router"
import { ComponentProps, JSXElement, Show } from "solid-js"
import { authClient } from "~/auth/authClient"

type P = {

}

export function AdminWrapper(props: {children: JSXElement}) {
    const session = authClient.useSession()
    return (
        <Show when={session().data?.user.role == "admin"}>
            {props.children}
        </Show>
    )
}