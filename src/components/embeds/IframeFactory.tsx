import { createEffect, Match, Setter, Switch } from "solid-js"
import { validateUrl } from "~/lib/validateUrl"
import { YouTubeIframe } from "./YoutubeIframe"
import { TwitchIframe } from "./TwitchIframe"

type Props = {
    link: string
    setError?: Setter<boolean>
}

export function IframeFactory(props: Props) {
    const res = () => {
        let url = validateUrl(props.link);
        if (!url) return null;
        return parseVideoUrl(url)
    }

    createEffect(() => {
        if (!res()) props.setError?.(true)
    })    

    return (
        <Switch>
            <Match when={props.link == ""}>
                {null}
            </Match>
            <Match when={res()?.[0] == "youtube"}>
                <YouTubeIframe slug={res()![1]} />
            </Match>
            <Match when={res()?.[0] === "twitch"}>
                <TwitchIframe slug={res()![1]} />
            </Match>

            {/* Default case */}
            <Match when={true}>
                <div style={{ color: "red" }}>
                    <p>Invalid or unsupported link. Examples of supported links:</p>
                    <ul>
                        <li>https://www.twitch.tv/user/clip/AdjectiveNoun-1234567</li>
                        <li>https://clips.twitch.tv/AdjectiveNoun-1234567</li>
                        <li>https://www.youtube.com/watch?v=dQw4w9WgXcQ </li>
                        <li>https://youtu.be/dQw4w9WgXcQ </li>
                        <li>https://www.youtube.com/shorts/dQw4w9WgXcQ </li>
                        <li>https://www.youtube.com/live/dQw4w9WgXcQ </li>
                        <li>https://www.youtube.com/embed/dQw4w9WgXcQ </li>
                    </ul>
                </div>
            </Match>
        </Switch>
    )
}

export function parseVideoUrl(url: URL) {

    const pathSegments = url.pathname.split('/').filter(Boolean);

    // Handle clips.twitch.tv/{slug}
    if (url.hostname === 'clips.twitch.tv') {
        if (pathSegments[0]) return ["twitch", pathSegments[0]] as const;
        return null
    }

    // Handle www.twitch.tv/{user}/clip/{slug}
    if (url.hostname.includes('twitch.tv')) {
        const clipIndex = pathSegments.indexOf('clip');
        if (clipIndex !== -1 && pathSegments[clipIndex + 1]) {
            return ["twitch", pathSegments[clipIndex + 1]] as const;
        }
        return null
    }
    // 1. Handle Shortened URLs (youtu.be/{ID})
    if (url.hostname === 'youtu.be') {
        const id = url.pathname.slice(1);
        if (id) return ["youtube", id] as const;
        return null
    }
    if (url.hostname.endsWith("youtube.com")) {
        // 2. Handle Standard URLs (youtube.com/watch?v={ID})
        if (url.pathname === '/watch') {
            const id = url.searchParams.get('v');
            if (id) return ["youtube", id] as const;
            return null
        }

        // 3. Handle Path-based URLs (/shorts/{ID}, /live/{ID}, /embed/{ID})
        const pathSegments = url.pathname.split('/').filter(Boolean);
        const triggerSegments = ['shorts', 'live', 'embed', 'v'];

        if (triggerSegments.includes(pathSegments[0])) {
            if (pathSegments[1]) return ["youtube", pathSegments[1]] as const;
            return null
        }

        return null
    }
    return null
}