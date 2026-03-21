type Props = {
    slug: string
}

export function TwitchIframe(props: Props) {
    return (
        <iframe
            src={`https://clips.twitch.tv/embed?clip=${props.slug}&parent=localhost&parent=1clip.cossie.dev&preload=metadata`}
            allowfullscreen
        />
    )
}