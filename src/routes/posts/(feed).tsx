import { createAsync } from "@solidjs/router"
import { JSXElement, Show } from "solid-js"
import { NavTabs } from "~/components/NavTabs/NavTabs"
import { getActiveSession } from "~/services/authService"

export default function FeedLayout(props: { children: JSXElement }) {
    const session = createAsync(() => getActiveSession())
    return (
        <>
            <Show when={session()}>
                <NavTabs
                    tabs={[{ href: "/posts", label: "All" }, { href: "/posts/for-you", label: "For You" }]}
                />
            </Show>
            {props.children}
        </>
    )
}