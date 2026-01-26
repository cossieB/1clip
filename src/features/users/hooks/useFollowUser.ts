import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useServerFn } from "@tanstack/solid-start";
import { followUserFn, getUserByUsernameFn } from "~/serverFn/users";

type User = Awaited<ReturnType<typeof getUserByUsernameFn>>

export function useFollowUser(user: {username: string, id: string}) {
    const follow = useServerFn(followUserFn)
    const queryClient = useQueryClient()
    const followUser = useMutation(() => ({
        mutationFn: () => follow({data: user.id}),
        onSuccess(data, variables, onMutateResult, context) {
            queryClient.setQueryData(["users", user.username], (old: User | undefined) => {
                if (!old) return;
                return {...old, isFollowing: data}
            })
        },
    }))
    return followUser
}