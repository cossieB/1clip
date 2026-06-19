import { Show } from "solid-js"
import { authClient } from "~/auth/authClient"
import { PostList } from "~/features/posts/components/PostList"

export default function ForYouRoute() {
    const session = authClient.useSession()
    return (
        <Show when={session().data}>
            <PostList
                filters={{
                    followerId: session().data!.user.id
                }}
            />
        </Show>
    )
}
