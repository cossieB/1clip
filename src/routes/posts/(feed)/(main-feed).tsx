import { Suspense } from "solid-js";
import { PostList } from "~/features/posts/components/PostList";

export default function MainFeed() {
    
    return (
        <Suspense>
            <PostList />
        </Suspense>
    )
}