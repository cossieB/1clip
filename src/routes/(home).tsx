import type { RouteDefinition } from '@solidjs/router';
import { SiteTitle } from '~/components/CustomSiteTitle';
import { PostList } from '~/features/posts/components/PostList';
import { SquadList } from '~/features/squads/components/SquadList';

export const route = {

} satisfies RouteDefinition;

export default function Home() {
    return (
        <div>
            <SiteTitle>Home</SiteTitle>
            <SquadList />
            <PostList />
        </div>
    )
}
