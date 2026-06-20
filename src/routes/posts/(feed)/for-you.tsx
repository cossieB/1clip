import { useQuery } from "@tanstack/solid-query"
import { Show } from "solid-js"
import { authClient } from "~/auth/authClient"
import { PostList } from "~/features/posts/components/PostList"
import { sessionQueryOpts } from "~/hooks/useServerSession"

export default function ForYouRoute() {
    const session = useQuery(() => sessionQueryOpts())
    return (
        <Show when={session.data}>
            <PostList
                filters={{
                    followerId: session.data!.id
                }}
            />
        </Show>
    )
}
