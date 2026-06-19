import { JSXElement, Show } from "solid-js"
import { authClient } from "~/auth/authClient"
import { NavTabs } from "~/components/NavTabs/NavTabs"

export default function FeedLayout(props: {children: JSXElement}) {
    const session = authClient.useSession()
    return (
        <>
            <Show when={session().data}>
                <NavTabs
                    tabs={[{ href: "/posts", label: "All" }, { href: "/posts/for-you", label: "For You" }]}
                />
            </Show>
            {props.children}
        </>
    )
}