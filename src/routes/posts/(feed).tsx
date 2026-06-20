import { useQuery } from "@tanstack/solid-query"
import { JSXElement, Show } from "solid-js"
import { NavTabs } from "~/components/NavTabs/NavTabs"
import { sessionQueryOpts } from "~/hooks/useServerSession"

export default function FeedLayout(props: { children: JSXElement }) {
    const session = useQuery(() => sessionQueryOpts())
    return (
        <>
            <Show when={session.data}>
                <NavTabs
                    tabs={[{ href: "/posts", label: "All" }, { href: "/posts/for-you", label: "For You" }]}
                />
            </Show>
            {props.children}
        </>
    )
}