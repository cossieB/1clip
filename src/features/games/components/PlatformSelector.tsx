import { createSignal } from "solid-js"
import { useQuery } from "@tanstack/solid-query"
import { getPlatformsFn } from "~/features/platforms/platformsApi"
import { CheckboxList } from "~/components/Forms/CheckboxList"


type Props = {
    /** Platforms checked on mount. Remount (e.g. with a key) to reseed it later */
    initialPlatformIds?: number[]
    onPlatformsChanged: (platformIds: number[]) => void
}

export function PlatformSelector(props: Props) {
    // getPlatforms returns {name: string, platformId: number}[]
    const query = useQuery(() => ({
        queryKey: ["platforms"],
        queryFn: getPlatformsFn,
        // The list is tiny and rarely changes, so fetch it once per session
        staleTime: Infinity
    }))

    // Initial value only, same pattern as GenreSelector
    const [selectedIds, setSelectedIds] = createSignal<number[]>(props.initialPlatformIds ?? [])

    const handleChange = (platformIds: number[]) => {
        setSelectedIds(platformIds)
        props.onPlatformsChanged(platformIds)
    }

    return (
        <CheckboxList
            label="Platforms"
            noun="platforms"
            items={query.data}
            isLoading={query.isPending}
            isError={query.isError}
            getKey={(platform) => platform.platformId}
            getLabel={(platform) => platform.name}
            value={selectedIds()}
            onChange={handleChange}
        />
    )
}