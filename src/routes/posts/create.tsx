import { createAsync, Navigate } from "@solidjs/router";
import { Show } from "solid-js";
import { CreatePostPage } from "~/features/posts/components/CreatePostPage";
import { getActiveSession } from "~/services/authService";

export default function PostCreateRoute() {
    const session = createAsync(() => getActiveSession())
    return (
        <Show
            when={session() === null}
            fallback={<CreatePostPage />}
        >
            <Navigate href="/auth/signin?redirect=/posts/create" />
        </Show>
    )
}
