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
            />
    )
}
