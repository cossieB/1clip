// The router lives in its own module so src/App.tsx (render) and
// src/server-config.ts (single-flight collector) share one instance.
import { pageRoutes } from 'virtual:file-routes';
import { createRouter, intentPreload, int } from '@solidjs/router';
import { fileRoutes } from '@solidjs/router/fs';
import Home from './routes/(home)';
import z from 'zod';
import NotFound from './routes/[...404]';
import ProfilePage from './features/users/components/ProfilePage';
import MainLayout from './components/MainLayout/MainLayout';
import { SettingsLayout } from './components/layouts/SettingsLayout';
import SecurityPage from './features/auth/components/SecurityPage';
import { PostId } from './features/posts/components/PostId';
import { getPostFn } from './features/posts/postsApi';
import { getProfile } from './features/users/userApi';
import { postRoutes } from './features/posts/postRoutes';


// Link preloading is opt-in. intentPreload() is the hover/focus/touch
// strategy: resting on a link warms its code and runs its preload, which is
// what makes navigation feel instant once the data lives on the server.
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
                },
                {
                    path: "*404",
                    component: NotFound
                },
                {
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
                },
                ...postRoutes
            ],
        }
    ]
});

export const { paths } = Router;