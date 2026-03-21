import { createEffect, ErrorBoundary, Setter, Show } from "solid-js"

type Props = {
    link: string
    setError?: Setter<boolean>
}

export function TwitchIframe(props: Props) {
    const slug = () => getTwitchClipSlug(props.link)
    createEffect(() => {
        if (slug() instanceof Error) props.setError?.(true)
    })
    return (
        <Show
            when={typeof slug() == "string"}
            fallback={<p> {(slug() as Error).message} </p>}
        >
            <iframe
                src={`https://clips.twitch.tv/embed?clip=${slug()}&parent=localhost&parent=1clip.cossie.dev&preload=metadata`}
                allowfullscreen
            />
        </Show>
    )
}

/**
 * Extracts a clip slug from Twitch URLs.
 * Supports:
 * - https://www.twitch.tv/{user}/clip/{slug}
 * - https://clips.twitch.tv/{slug}
 */
function getTwitchClipSlug(urlString: string): string | Error {
    if (!urlString) return new Error("")
    let url: URL;
    try {
        url = new URL(urlString);
    } catch (e) {
        return new Error("Invalid URL: The string provided is not a well-formed URL.");
    }

    const pathSegments = url.pathname.split('/').filter(Boolean);

    // Handle clips.twitch.tv/{slug}
    if (url.hostname === 'clips.twitch.tv') {
        if (pathSegments[0]) return pathSegments[0];
        return new Error("Missing Slug: clips.twitch.tv URL found, but no slug was present in the path.");
    }

    // Handle www.twitch.tv/{user}/clip/{slug}
    if (url.hostname.includes('twitch.tv')) {
        const clipIndex = pathSegments.indexOf('clip');
        if (clipIndex !== -1 && pathSegments[clipIndex + 1]) {
            return pathSegments[clipIndex + 1];
        }
        return new Error("Missing Slug: Twitch URL found, but it doesn't appear to be a clip link.");
    }

    return new Error("Wrong Domain: The provided URL is not a Twitch domain.");
}