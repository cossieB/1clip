type Props = {
    slug: string
}

export function YouTubeIframe(props: Props) {

    return (
        <iframe
            src={`https://www.youtube.com/embed/${props.slug}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
        />
    )
}

export function TwitchIframe(props: Props) {
    return (
        <iframe
            src={`https://clips.twitch.tv/embed?clip=${props.slug}&parent=localhost&parent=1clip.cossie.dev&preload=metadata`}
            allowfullscreen
        />
    )
}