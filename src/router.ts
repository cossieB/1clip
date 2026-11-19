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
import { PostsPage } from './features/posts/pages/posts';
import { PostId } from './features/posts/pages/posts[id]';
import { SquadsPage } from './features/squads/pages/squads';
import { UserIdLayout } from './features/users/pages/user[id].layout';
import { UserPosts } from './features/users/pages/user[id].posts';
import { UserSquads } from './features/users/pages/user[id].squads';
import { GameIdRoute } from './features/games/pages/game[id]';
import { GetGamesSchema } from './features/games/utils/zod';
import { GamesPage as GamesRoute } from './features/games/pages/games';
import { CompanyIdRoute } from './features/companies/pages/company[id]';
import { ActorIdRoute } from './features/actors/pages/actor[id]';
import { PlatformIdRoute } from './features/platforms/pages/platform[id]';
import { NotificationsRoute } from './features/notifications/pages/notifications';
import { ensureAdminOrRedirect, ensureAuthOrRedirect } from './features/auth/utils/ensureAuth';
import SearchRoute from './features/search/routes/search';
import { SquadIdRoute } from './features/squads/pages/squad[id]';
import { AdminGameRoute } from './features/games/pages/admin.game[id]';
import { AdminGameCreateRoute } from './features/games/pages/admin.game.create';
import { AdminCompanyRoute } from './features/companies/pages/admin.company[id]';
import { AdminCompanyCreate } from './features/companies/pages/admin.company.new';
import { AdminPlatformRoute } from './features/platforms/pages/admin.platform[id]';
import { AdminPlatformCreate } from './features/platforms/pages/admin.platform.new';
import { AdminActorCreate } from './features/actors/pages/admin.actor.new';
import { AdminActorRoute } from './features/actors/pages/admin.actor[id]';
import { AdminGamesRoute } from './features/games/pages/admin.games';
import { AdminCompaniesRoute } from './features/companies/pages/admin.companies';
import { AdminPlatformsRoute } from './features/platforms/pages/admin.platforms';
import { AdminActorsRoute } from './features/actors/pages/admin.actors';

// Link preloading is opt-in. intentPreload() is the hover/focus/touch
// strategy: resting on a link warms its code and runs its preload, which is
// what makes navigation feel instant once the data lives on the server.

const CreateSquadPage = clientOnly(() => import("~/features/squads/components/CreateSquadPage"))
const AdminLayout = clientOnly(() => import("~/components/layouts/AdminLayout"))

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
                    path: "/posts",
                    component: PostsPage,
                    search: z.object({
                        tag: z.string().optional()
                    }).optional()
                }, {
                    path: "/posts/:postId",
                    component: PostId,
                    matchFilters: {
                        postId: int
                    },
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
                    component: SquadsPage,
                    search: z.object({
                        gameId: z.string().optional()
                    }).optional()
                }, {
                    path: "/squads/:squadId",
                    matchFilters: {
                        squadId: int
                    },
                    component: SquadIdRoute
                }, {
                    path: "/users/:username",
                    component: UserIdLayout,
                    children: [
                        {
                            path: ["/", "/posts"],
                            component: UserPosts
                        }, {
                            path: "/squads",
                            component: UserSquads
                        }
                    ]
                }, {
                    path: "/games/:gameId",
                    component: GameIdRoute
                }, {
                    path: "/games",
                    search: GetGamesSchema,
                    component: GamesRoute
                }, {
                    path: "/companies/:companyId",
                    component: CompanyIdRoute,

                }, {
                    path: "/actors/:actorId",
                    component: ActorIdRoute
                }, {
                    path: "/platforms/:platformId",
                    component: PlatformIdRoute
                }, {
                    path: "/notifications",
                    component: NotificationsRoute,
                    preload: () => void ensureAuthOrRedirect()
                }, {
                    path: "/search",
                    component: SearchRoute,
                    search: z.object({
                        q: z.string().catch(""),
                        type: z.enum(["posts", "games", "squads"]),
                        page: z.string(),
                    })
                }
            ],
        },
        {
            component: AdminLayout,
            path: "/admin",
            preload: () => void ensureAdminOrRedirect(),
            children: [
                {
                    path: "/games",
                    component: AdminGamesRoute
                }, {
                    path: "/games/:gameId",
                    matchFilters: {
                        gameId: int
                    },
                    component: AdminGameRoute
                }, {
                    path: "/games/add",
                    component: AdminGameCreateRoute
                }, {
                    path: "/companies",
                    component: AdminCompaniesRoute
                }, {
                    path: "/companies/:companyId",
                    matchFilters: {
                        companyId: int
                    },
                    component: AdminCompanyRoute,
                }, {
                    path: "/companies/add",
                    component: AdminCompanyCreate
                }, {
                    path: "/platforms",
                    component: AdminPlatformsRoute
                }, {
                    path: "/platforms/:platformId",
                    component: AdminPlatformRoute,
                    matchFilters: {
                        platformId: int
                    },
                }, {
                    path: "/platforms/add",
                    component: AdminPlatformCreate
                }, {
                    path: "/actors",
                    component: AdminActorsRoute
                }, {
                    path: "/actors/add",
                    component: AdminActorCreate
                }, {
                    path: "/actors/:actorId",
                    component: AdminActorRoute,
                    matchFilters: {
                        actorId: int
                    }
                },
            ]
        }

    ]
});

export const { paths } = Router;