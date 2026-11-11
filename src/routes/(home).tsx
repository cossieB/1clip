import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { httpHeader } from '@solidjs/web';
import { SiteTitle } from '~/components/CustomSiteTitle';
import { PostList } from '~/features/posts/components/PostList';
import { SquadList } from '~/features/squads/components/SquadList';

export const route = {

} satisfies RouteDefinition;

export default function Home() {
    httpHeader("Cache-Control", "private, max-age=600")
    return (
        <div>
            <SiteTitle>Home</SiteTitle>
            <SquadList />
            <PostList />
        </div>
    )
}
