import { httpHeader } from "@solidjs/web";
import { PostList } from "../components/PostList";

export function PostsPage() {
    httpHeader("Cache-Control", "private, max-age=600")
    return (
        <PostList />
    )
}
