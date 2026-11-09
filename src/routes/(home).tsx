import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { httpHeader } from '@solidjs/web';
import { For, Show, createMemo } from 'solid-js';
import { PostComposer } from '~/features/posts/components/PostComposer';
import { PostList } from '~/features/posts/components/PostList';

export const route = {

} satisfies RouteDefinition;

export default function Home() {
    httpHeader("Cache-Control", "private; max-age=600")
    return (
        <div>
            <PostComposer />
            <PostList />
        </div>
    )
}
