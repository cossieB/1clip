import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { For, Show, createMemo } from 'solid-js';
import { PostComposer } from '~/features/posts/components/PostComposer';

export const route = {

} satisfies RouteDefinition;

export default function Home() {
    return (
        <div>
                <PostComposer />
        </div>
    )
}
