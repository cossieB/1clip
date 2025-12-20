import { createFileRoute, Link, Outlet } from '@tanstack/solid-router'
import { NavTabs } from '~/components/NavTabs/NavTabs'

export const Route = createFileRoute('/settings')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div class={"page"}>
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