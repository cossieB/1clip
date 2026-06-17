import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { followUserFn, getUserByUsernameFn } from "~/services/userService";


type User = Awaited<ReturnType<typeof getUserByUsernameFn>>

export function useFollowUser(user: {username: string, id: string}) {
    const queryClient = useQueryClient()
    const followUser = useMutation(() => ({
        mutationFn: () => followUserFn(user.id),
        onSuccess(data, variables, onMutateResult, context) {
            queryClient.setQueryData(["users", user.username], (old: User | undefined): User | undefined => {
                if (!old) return;
                return {...old, isFollowing: data}
            })
            queryClient.setQueryData(["users", user.id], (old: User | undefined): User | undefined => {
                if (!old) return;
                return {...old, isFollowing: data}
            })
        },
    }))
    return followUser
}