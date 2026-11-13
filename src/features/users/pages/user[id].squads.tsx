import { useParams } from "@solidjs/router";
import { Loading } from "solid-js";
import { PostList } from "~/features/posts/components/PostList";
import { SquadList } from "~/features/squads/components/SquadList";
import { paths } from "~/router";

export function UserSquads() {
    const params = useParams(paths.users)
    return (
        <Loading>
            <SquadList
                filters={{
                    username: params.username
                }}
            />
        </Loading>
    )
}