import { useParams } from "@solidjs/router";
import { Loading } from "solid-js";
import { PostList } from "~/features/posts/components/PostList";
import { paths } from "~/router";

export function UserPosts() {
    const params = useParams(paths.users)
    return (
        <Loading>
            <PostList
                filters={{
                    username: params.username
                }}
            />
        </Loading>
    )
}