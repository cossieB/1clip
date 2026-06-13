import { QueryClient } from '@tanstack/solid-query'
import { createRouter } from '@tanstack/solid-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/solid-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary'
import { NotFound } from './components/NotFound/NotFound'
import { getStartContext } from '@tanstack/start-storage-context'
import { createIsomorphicFn } from '@tanstack/solid-start'

const getNonce = createIsomorphicFn()
  .server(() => getStartContext().contextAfterGlobalMiddlewares.nonce)
  .client(() => document.querySelector<HTMLMetaElement>("meta[property=csp-nonce]")?.content)

export function getRouter() {
    const nonce = getNonce();

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                gcTime: Infinity,
                refetchOnMount: false,
                retry: false,
                // retry(failureCount, error) {
                //     return failureCount < 3
                // },
                refetchOnWindowFocus: false,
                staleTime: Infinity,
                throwOnError: true,
            },
        }
    })

    const router = createRouter({
        routeTree,
        context: { queryClient },
        ssr: {
            nonce
        },
        scrollRestoration: true,
        defaultPreload: false,
        defaultPreloadStaleTime: 0,
        defaultErrorComponent: DefaultCatchBoundary,
        defaultNotFoundComponent: () => <NotFound />,
        defaultViewTransition: true
    })
    setupRouterSsrQueryIntegration({
        router,
        queryClient,
    })

    return router
}

declare module '@tanstack/solid-router' {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
