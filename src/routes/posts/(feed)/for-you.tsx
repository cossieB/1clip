import { createAsync } from "@solidjs/router"
import { Show } from "solid-js"
import { MySiteTitle } from "~/components/MySiteTitle"
import { PostList } from "~/features/posts/components/PostList"
import { getActiveSession } from "~/services/authService"

export default function ForYouRoute() {
    const session = createAsync(() => getActiveSession())
    return (
        <Show when={session()}>
            <MySiteTitle>For You</MySiteTitle>
            <PostList
                filters={{
                    followerId: session()!.id
                }}
            />
        </Show>
    )
}
