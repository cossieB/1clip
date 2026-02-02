import { createFileRoute, Outlet, useNavigate } from '@tanstack/solid-router'
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
    const searchParams = Route.useSearch()
    const navigate = useNavigate()
    return (
        <div>
            <SearchBar
                //@ts-expect-error
                initialValue={searchParams()?.s}
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
