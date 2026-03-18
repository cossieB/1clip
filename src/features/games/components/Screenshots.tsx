import { Show } from "solid-js"
import { Carousel } from "~/components/Carousel/Carousel"
import {type getGameFn } from "~/serverFn/games"
import { STORAGE_DOMAIN } from "~/utils/env"

type Props = {
    media: Awaited<ReturnType<typeof getGameFn>>['media']
}

export function Screenshots(props: Props) {
    const screenshots = props.media.filter(m => m.contentType.startsWith("image"))
    return (
        <Show when={screenshots.length > 0}>
            <h2>Screenshots</h2>
            <Carousel
                media={
                    screenshots
                        .map(m => ({
                            contentType: m.contentType,
                            url: STORAGE_DOMAIN + m.key
                        }))}
                showNextBtn
                showPrevBtn
            />
        </Show>
    )
}