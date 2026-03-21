import { Show } from "solid-js"
import { validateUrl } from "~/lib/validateUrl"

type Props = {
    link: string
}

export function YouTubeIframe(props: Props) {
    const id = () => getYoutubeVideoId(props.link)
    return (
        <Show when={id()}>
            <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${id()}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
            />
        </Show>
    )
}

/**
 * Extracts a YouTube Video ID from various URL formats.
 * Supports:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ (Standard)
 * - https://youtu.be/dQw4w9WgXcQ (Shortened)
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ (Shorts)
 * - https://www.youtube.com/live/dQw4w9WgXcQ (Live)
 * - https://www.youtube.com/embed/dQw4w9WgXcQ (Embed)
 */
function getYoutubeVideoId(urlString: string): string | null {
    try {
        const url = new URL(urlString);

        // 1. Handle Shortened URLs (youtu.be/ID)
        if (url.hostname === 'youtu.be') {
            return url.pathname.slice(1) || null;
        }

        // 2. Handle Standard URLs (youtube.com/watch?v=ID)
        if (url.pathname === '/watch') {
            return url.searchParams.get('v');
        }

        // 3. Handle Path-based URLs (/shorts/ID, /live/ID, /embed/ID)
        const pathSegments = url.pathname.split('/').filter(Boolean);
        const triggerSegments = ['shorts', 'live', 'embed', 'v'];

        // Check if the first segment is one of our triggers
        if (triggerSegments.includes(pathSegments[0])) {
            return pathSegments[1] || null;
        }

        return null;
    } catch (e) {
        return null; // Invalid URL string
    }
}