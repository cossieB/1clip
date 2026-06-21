import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { Show } from "solid-js"
import { PostList } from "~/features/posts/components/PostList"
import { getActiveSession } from "~/services/authService"

export default function ForYouRoute() {
    const session = createAsync(() => getActiveSession())
    return (
        <Show when={session()}>
            <Title>For You</Title>
            <PostList
                filters={{
                    followerId: session()!.id
                }}
            />
        </Show>
    )
}
