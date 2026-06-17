import { useQuery } from "@tanstack/solid-query";
import { Suspense } from "solid-js";
import { getUserReputation } from "~/services/userService";
import { STORAGE_DOMAIN } from "~/utils/env";

export default function UserRank(props: {userId: string, enabled?: boolean}) {
    const result = useQuery(() => ({
        queryKey: ["xp", props.userId],
        queryFn: () => getUserReputation(props.userId),
        enabled: props.enabled ?? true
    }))

    return (
        <Suspense>
            <img src={`${STORAGE_DOMAIN}ranks/${result.data?.rank}.png`} alt="" />
            <span>{result.data?.xp} xp</span>
        </Suspense>
    )
}