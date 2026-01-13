/// <reference types="vite/client" />
import {
    HeadContent,
    Link,
    Outlet,
    Scripts,
    createRootRouteWithContext,
    useSearch,
} from '@tanstack/solid-router'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import { HydrationScript } from 'solid-js/web'
import * as Solid from 'solid-js'
import type { QueryClient } from '@tanstack/solid-query'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound/NotFound'
import { seo } from '~/utils/seo'
import appCss from '/app.css?url'
import resetCss from '/reset.css?url'
import { MainLayout } from '~/components/MainLayout/MainLayout'
import { ToastProvider } from '~/components/Toast/ToastProvider'
import z from 'zod'
import { useToastContext } from '~/hooks/useToastContext'

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
}>()({
    head: () => ({
        meta: [
            {
                charset: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            ...seo({
                title: 'GG',
                description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
            }),
        ],
        links: [
            { rel: "stylesheet", href: resetCss },
            { rel: 'stylesheet', href: appCss },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/apple-touch-icon.png',
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                href: '/favicon-32x32.png',
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                href: '/favicon-16x16.png',
            },
            { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
            { rel: 'icon', href: '/favicon.ico' },
            {
                href: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Orbitron:wght@400..900&family=Press+Start+2P&display=swap",
                rel: "stylesheet"
            }
        ],
    }),
    errorComponent: (props) => {
        return (
            <RootDocument>
                <DefaultCatchBoundary {...props} />
            </RootDocument>
        )
    },
    notFoundComponent: () => <NotFound />,
    component: RootComponent,
    validateSearch: z.object({
        toasts: z.array(z.object({
            text: z.string(),
            type: z.enum(["error", "info", "warning"]).catch("info"),
            autoFade: z.boolean().optional().default(true)
        })).optional().catch(undefined)
    })
})

function RootComponent() {
    return (
        <ToastProvider>
            <RootDocument>
                <Outlet />
            </RootDocument>
        </ToastProvider>
    )
}

function RootDocument(props: { children: Solid.JSX.Element }) {
    const search = Route.useSearch()
    const { addToast } = useToastContext()

    Solid.createEffect(() => {
        (search().toasts ?? []).forEach(toast => addToast(toast))
    })

    return (
        <html>
            <head>
                <HydrationScript />
            </head>
            <body>
                <HeadContent />
                {props.children}
                <TanStackRouterDevtools position="bottom-right" />
                <SolidQueryDevtools buttonPosition="bottom-left" />
                <Scripts />
            </body>
        </html>
    )
}
