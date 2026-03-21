import { createEffect, Setter, Show } from "solid-js"

type Props = {
    link: string
    setError?: Setter<boolean>
}

export function YouTubeIframe(props: Props) {
    const slug = () => getYoutubeVideoId(props.link)
    createEffect(() => {
        if (slug() instanceof Error) props.setError?.(true)
    })
    return (
        <Show
            when={typeof slug() == "string"}
            fallback={<p> {(slug() as Error).message} </p>}            
        >
            <iframe
                src={`https://www.youtube.com/embed/${slug()}`}
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
function getYoutubeVideoId(urlString: string): string | Error {
    if (!urlString) return new Error("")
    let url: URL;

    try {
        url = new URL(urlString);
    } catch (e) {
        return new Error("Invalid URL: The string provided is not a well-formed URL.");
    }

    // 1. Handle Shortened URLs (youtu.be/{ID})
    if (url.hostname === 'youtu.be') {
        const id = url.pathname.slice(1);
        if (id) return id;
        return new Error("Missing ID: youtu.be link found, but the video ID is missing.");
    }

    // Check if it's even a YouTube domain before proceeding
    if (!url.hostname.endsWith('youtube.com')) {
        return new Error("Wrong Domain: The provided URL is not a YouTube domain.");
    }

    // 2. Handle Standard URLs (youtube.com/watch?v={ID})
    if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        if (id) return id;
        return new Error("Missing Parameter: Standard YouTube URL found, but the 'v' parameter is missing.");
    }

    // 3. Handle Path-based URLs (/shorts/{ID}, /live/{ID}, /embed/{ID})
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const triggerSegments = ['shorts', 'live', 'embed', 'v'];

    if (triggerSegments.includes(pathSegments[0])) {
        if (pathSegments[1]) return pathSegments[1];
        return new Error(`Missing ID: YouTube ${pathSegments[0]} link found, but no video ID followed the path.`);
    }

    return new Error("Identification Failed: This is a YouTube URL, but no recognizable video ID format was detected.");
}