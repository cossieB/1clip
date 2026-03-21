import { ErrorBoundary, Show } from "solid-js"
import { validateUrl } from "~/lib/validateUrl"

function TwitchIframe(props: { link: string }) {
    const id = () => getTwitchClipSlug(props.link)

    return (
        <Show when={id()}>
            <iframe
                src={`https://clips.twitch.tv/embed?clip=${id()}&parent=localhost&parent=1clip.cossie.dev&preload=metadata`}
                height={720}
                width={1280}
                allowfullscreen
            />
        </Show>
    )
}

export function TwitchEmbed(props: { link: string }) {
    return (
        <ErrorBoundary
            fallback={error => <div>{error}</div>}
        >
            <TwitchIframe link={props.link} />
        </ErrorBoundary>
    )
}

/**
 * Extracts a clip slug from Twitch URLs.
 * Supports:
 * - https://www.twitch.tv/{user}/clip/{slug}
 * - https://clips.twitch.tv/{slug}
 */
function getTwitchClipSlug(urlString: string): string | null {
    try {
        const url = new URL(urlString);
        const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);

        // Format: clips.twitch.tv/{slug}
        if (url.hostname === 'clips.twitch.tv') {
            return pathSegments[0] ?? null;
        }

        // Format: twitch.tv/{user}/clip/{slug}
        if (url.hostname.includes('twitch.tv')) {
            const clipIndex = pathSegments.indexOf('clip');

            // Ensure "clip" exists and there is a segment after it
            if (clipIndex !== -1 && pathSegments[clipIndex + 1]) {
                return pathSegments[clipIndex + 1];
            }
        }

        return null;
    } catch (e) {
        // Returns null if the string is not a valid URL
        return null;
    }
}

// --- Examples ---
console.log(getTwitchClipSlug("https://www.twitch.tv/shroud/clip/RelentlessSparklingWaffle-12345?tt_medium=redt"));
// Output: "RelentlessSparklingWaffle-12345"

console.log(getTwitchClipSlug("https://clips.twitch.tv/ShortExampleSlug"));
// Output: "ShortExampleSlug"