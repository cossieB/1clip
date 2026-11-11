import { httpHeader, Show } from "@solidjs/web";
import { PostList } from "../components/PostList";
import { useSearchParams } from "@solidjs/router";
import { paths } from "~/router";

export function PostsPage() {
    httpHeader("Cache-Control", "private, max-age=600")
    const [search] = useSearchParams(paths.posts)

    const filters = () => ({...search})
    
    return (
        // remount the PostList component to reset the infinite scroll
        <Show when={filters()} keyed>
            {(f) => <PostList filters={f} />}
        </Show>
    )
}
