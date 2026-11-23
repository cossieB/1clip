import { Show } from "@solidjs/web";
import { PostList } from "../components/PostList";
import { useSearchParams } from "@solidjs/router";
import { paths } from "~/router";
import { SiteTitle } from "~/components/CustomSiteTitle";

export function PostsPage() {
    const [search] = useSearchParams(paths.posts)

    const filters = () => ({
        ...search,
        gameId: Number(search?.gameId) || undefined
    })
    
    return (
        // remount the PostList component to reset the infinite scroll
        <Show when={filters()} keyed>
            {(f) => (
                <>
                <SiteTitle> Posts </SiteTitle>
                <PostList filters={f} />
                </>
            )}
        </Show>
    )
}
