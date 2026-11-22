import { createMemo, createSignal, Loading } from "solid-js"
import { getPlatformsFn } from "~/features/platforms/platformsApi"
import { CheckboxList } from "~/components/Forms/CheckboxList"


type Props = {
    /** Platforms checked on mount. Remount (e.g. with a key) to reseed it later */
    initialPlatformIds?: number[]
    onPlatformsChanged: (platformIds: number[]) => void
}

export function PlatformSelector(props: Props) {
    // getPlatforms returns {name: string, platformId: number}[]
    const platforms = createMemo(() => getPlatformsFn({}))

    // Initial value only, same pattern as GenreSelector
    const [selectedIds, setSelectedIds] = createSignal<number[]>(() => props.initialPlatformIds ?? [])

    const handleChange = (platformIds: number[]) => {
        setSelectedIds(platformIds)
        props.onPlatformsChanged(platformIds)
    }

    return (
        <Loading>

            <CheckboxList
                label="Platforms"
                noun="platforms"
                items={platforms()}
                getKey={(platform) => platform.platformId}
                getLabel={(platform) => platform.name}
                value={selectedIds()}
                onChange={handleChange}
            />
        </Loading>
    )
}