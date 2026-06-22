import { useParams } from "@solidjs/router"
import { useQueryClient, useQuery } from "@tanstack/solid-query"
import { createEffect, JSXElement, Match, Show, Suspense, Switch } from "solid-js"
import { NavTabs } from "~/components/NavTabs/NavTabs"
import { UserPage } from "~/features/users/components/UserPage"
import { userQueryOpts } from "~/features/users/utils/userQueryOpts"
import { getUserByUsernameFn } from "~/services/userService"
import NotFound from "../[...404]"
import { MySiteTitle } from "~/components/MySiteTitle"

export default function UserRoute(props: { children: JSXElement }) {
    const params = useParams()
    const queryClient = useQueryClient()
    const result = useQuery(() => ({
        queryKey: ["users", params.username?.toLowerCase()],
        queryFn: () => getUserByUsernameFn(params.username?.toLowerCase()!)
    }))

    createEffect(() => {
        if (result.data)
            queryClient.setQueryData(userQueryOpts(result.data.id).queryKey, result.data)
    })

    return (
        <Switch>

            <Match when={result.data}>
                <MySiteTitle> {result.data!.displayName} </MySiteTitle>
                <UserPage user={result.data!} />
                <NavTabs
                    tabs={[{
                        label: "posts",
                        href: `/users/${params.username}/posts`
                    }, {
                        label: "likes",
                        href: `/users/${params.username}/likes`
                    }]}
                />
                {props.children}
            </Match>
            <Match when={result.data === null}>
                <NotFound message="That user doesn't exist" />
            </Match>
        </Switch>
    )
}