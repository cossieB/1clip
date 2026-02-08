import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/solid-router'
import { SearchBar } from '~/components/Search/Searchbar'
import { NavTabs } from '~/components/NavTabs/NavTabs'
import z from 'zod'

export const Route = createFileRoute('/_pub/search')({
    component: RouteComponent,
    validateSearch: z.object({
        s: z.string().optional()
    }).optional(),
})

function RouteComponent() {
    const location = useLocation()
    const navigate = useNavigate()
    return (
        <div>
            <SearchBar
                initialValue={location().search.s}
                onSearch={s => navigate({
                    to: ".",
                    search: { s }
                })}
            />
            <NavTabs
                tabs={[{
                    label: "Posts",
                    to: "/search/posts"
                }, {
                    label: "Games",
                    to: "/search/games"
                }]}
            />
            <Outlet />
        </div>
    )
}
