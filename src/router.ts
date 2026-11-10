// The router lives in its own module so src/App.tsx (render) and
// src/server-config.ts (single-flight collector) share one instance.
import { createRouter, int } from '@solidjs/router';
import Home from './routes/(home)';
import z from 'zod';
import NotFound from './routes/[...404]';
import ProfilePage from './features/users/components/ProfilePage';
import MainLayout from './components/MainLayout/MainLayout';
import { SettingsLayout } from './components/layouts/SettingsLayout';
import SecurityPage from './features/auth/components/SecurityPage';
import { CreatePostLayout } from './components/layouts/CreatePostLayout';
import { CreatePostPage } from './features/posts/components/CreatePostPage';
import { clientOnly } from '@solidjs/web';
import { PostId } from './features/posts/components/PostId';
import { SquadList } from './features/squads/components/SquadList';


// Link preloading is opt-in. intentPreload() is the hover/focus/touch
// strategy: resting on a link warms its code and runs its preload, which is
// what makes navigation feel instant once the data lives on the server.

const CreateSquadPage = clientOnly(() => import("~/features/squads/components/CreateSquadPage"))

export const Router = createRouter({
    routes: [
        {
            component: MainLayout,
            children: [
                {
                    path: "/",
                    component: Home,
                    search: z.object({
                        dialog: z.enum(["signup", "signin", "reset"]).optional().catch(undefined),
                        token: z.string()
                    }).optional().catch(undefined)
                }, {
                    path: "*404",
                    component: NotFound
                }, {
                    component: SettingsLayout,
                    children: [
                        {
                            path: "/profile",
                            component: ProfilePage,
                        },
                        {
                            path: "/security",
                            component: SecurityPage
                        }
                    ]
                }, {
                    component: CreatePostLayout,
                }, {
                    path: "/posts/:postId",
                    matchFilters: {
                        postId: int
                    },
                    component: PostId,
                }, {
                    component: CreatePostLayout,
                    children: [
                        {
                            path: "/squads/create",
                            component: CreateSquadPage
                        }, {
                            path: "/posts/create",
                            component: CreatePostPage
                        }
                    ]
                }, {
                    path: "/squads",
                    component: SquadList
                }
            ],
        }
    ]
});

export const { paths } = Router;