import type { RouteDefinition } from '@solidjs/router';
import { SiteTitle } from '~/components/CustomSiteTitle';
import { ShowWhenAuthed } from '~/features/auth/components/ShowWhenAuthed';
import { DailyChallenges } from '~/features/challenges/components/DailyChallenges';
import { PostList } from '~/features/posts/components/PostList';
import { SquadList } from '~/features/squads/components/SquadList';

export const route = {

} satisfies RouteDefinition;

export default function Home() {
    return (
        <div>
            <SiteTitle>Home</SiteTitle>
            <ShowWhenAuthed>
                <DailyChallenges />
            </ShowWhenAuthed>
            <SquadList />
            <PostList />
        </div>
    )
}
