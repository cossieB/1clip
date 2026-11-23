// The router lives in its own module so src/App.tsx (render) and
// src/server-config.ts (single-flight collector) share one instance.
import { createRouter, int } from '@solidjs/router';
import { clientOnly } from '@solidjs/web';
import z from 'zod';
import { ActorIdRoute } from '~/features/actors/routes/actor[id]';
import { AdminActorCreate } from '~/features/actors/routes/admin.actor.new';
import { AdminActorRoute } from '~/features/actors/routes/admin.actor[id]';
import { AdminActorsRoute } from '~/features/actors/routes/admin.actors';
import { ensureAdminOrRedirect, ensureAuthOrRedirect, ensureUnauthed } from '~/features/auth/authApi';
import SecurityPage from '~/features/auth/routes/security';
import { AdminCompaniesRoute } from '~/features/companies/routes/admin.companies';
import { AdminCompanyCreate } from '~/features/companies/routes/admin.company.new';
import { AdminCompanyRoute } from '~/features/companies/routes/admin.company[id]';
import { CompanyIdRoute } from '~/features/companies/routes/company[id]';
import { AdminGameCreateRoute } from '~/features/games/routes/admin.game.create';
import { AdminGameRoute } from '~/features/games/routes/admin.game[id]';
import { AdminGamesRoute } from '~/features/games/routes/admin.games';
import { GameIdRoute } from '~/features/games/routes/game[id]';
import { GamesRoute } from '~/features/games/routes/games';
import { GetGamesSchema } from '~/features/games/utils/zod';
import { NotificationsRoute } from '~/features/notifications/routes/notifications';
import { AdminPlatformCreate } from '~/features/platforms/routes/admin.platform.new';
import { AdminPlatformRoute } from '~/features/platforms/routes/admin.platform[id]';
import { AdminPlatformsRoute } from '~/features/platforms/routes/admin.platforms';
import { PlatformIdRoute } from '~/features/platforms/routes/platform[id]';
import { CreatePostPage } from '~/features/posts/components/CreatePostPage';
import { PostsPage } from '~/features/posts/routes/posts';
import { PostId } from '~/features/posts/routes/posts[id]';
import SearchRoute from '~/features/search/routes/search';
import { SquadIdRoute } from '~/features/squads/routes/squad[id]';
import { SquadsPage } from '~/features/squads/routes/squads';
import ProfilePage from '~/features/users/routes/profile';
import { UserIdLayout } from '~/features/users/routes/user[id].layout';
import { UserPosts } from '~/features/users/routes/user[id].posts';
import { UserSquads } from '~/features/users/routes/user[id].squads';
import Landing from './components/Landing/Landing';
import { CreatePostLayout } from './components/layouts/CreatePostLayout';
import MainLayout from './components/layouts/MainLayout/MainLayout';
import { SettingsLayout } from './components/layouts/SettingsLayout';
import Home from './routes/(home)';
import NotFound from './routes/[...404]';
import { SignupRoute } from './features/auth/routes/signup';
import { SigninRoute } from './features/auth/routes/signin';
import { ResetPasswordRoute } from './features/auth/routes/reset';

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
                        tag: z.string().optional(),
                        gameId: z.string().optional()
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
                }, {
                    path: "/auth",
                    preload: () => void ensureUnauthed(),
                    children: [{
                        path: "/signup",
                        component: SignupRoute
                    }, {
                        path: "/signin",
                        component: SigninRoute,
                        search: z.object({
                            redirect: z.string().optional()
                        })
                    }, {
                        path: "/reset",
                        component: ResetPasswordRoute,
                        search: z.object({
                            token: z.string().optional()
                        })
                    }]
                },
            ],
        }, {
            component: AdminLayout,
            path: "/admin",
            preload: () => void ensureAdminOrRedirect(),
            children: [{
                path: "/",
                component: () => "Admin Page"
            }, {
                path: "/games",
                component: AdminGamesRoute
            }, {
                path: "/games/add",
                component: AdminGameCreateRoute
            }, {
                path: "/games/:gameId",
                matchFilters: {
                    gameId: int
                },
                component: AdminGameRoute
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
            }]
        },
        {
            path: "/landing",
            component: Landing
        }
    ]
});

export const { paths } = Router;