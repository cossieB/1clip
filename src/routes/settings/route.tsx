import { createFileRoute, Link, Outlet, ParsedLocation, redirect, useLocation } from '@tanstack/solid-router'
import { createServerFn } from '@tanstack/solid-start'
import { Show } from 'solid-js'
import { authClient } from '~/auth/authClient'
import { NavTabs } from '~/components/NavTabs/NavTabs'
import { checkSessionFn, getCurrentUser } from '~/services/authService'

const getSessionFn = createServerFn()
    .inputValidator((str: string) => str)
    .handler(async ({ data }) => {
        const id = await getCurrentUser()
        if (!id) throw redirect({ to: "/auth/signin", search: { redirect: data }, reloadDocument: true })
    })

export const Route = createFileRoute('/settings')({
    component: RouteComponent,
    loader: ({location}) => getSessionFn({data: location.href})
})

function RouteComponent() {
    const session = authClient.useSession()
    const isUnverified = () => {
        const data = session().data
        if (!data) return false
        return !data.user.emailVerified
    }
    return (
        <div class={"page"}>
            <Show when={isUnverified()}>
                <aside
                    style={{ "background-color": "red", padding: "0.5rem 1rem" }}
                >
                    Your account is unverified. Check your email for the verification link
                </aside>
            </Show>
            <NavTabs
                tabs={[{
                    label: "Profile",
                    to: "/settings/profile"
                }, {
                    label: "Security",
                    to: "/settings/security"
                }]}
            />
            <Outlet />
        </div>
    )
}