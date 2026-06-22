import { useQueryClient, useQuery } from "@tanstack/solid-query"
import { createEffect, Match, Suspense, Switch } from "solid-js"
import { MySiteTitle } from "~/components/MySiteTitle"
import { Profile } from "~/features/users/components/ProfilePage"
import { getLoggedInUser } from "~/services/userService"

export default function ProfileRoute() {
    const queryClient = useQueryClient()
    const user = useQuery(() => ({
        queryKey: ["loggedInUser"],
        queryFn: () => getLoggedInUser()
    }))

    createEffect(() => {
        if (user.data)
            queryClient.setQueryData(["users", user.data.id], user.data)
    })

    return (
        <Switch>
            <Match when={user.data}>
                <MySiteTitle>Profile</MySiteTitle>
                <Profile user={user.data!} />
            </Match>
            <Match when={user.error}>
                {user.error?.message}
            </Match>
        </Switch>
    )
}