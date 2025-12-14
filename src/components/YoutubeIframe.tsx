import { validateUrl } from "~/lib/validateUrl"

type Props = {
    link: string | URL
}

export function YouTubeIframe({ link }: Props) {
    let errorMsg = "Failed to load YouTube"
    const url = link instanceof URL ? link : validateUrl(link)
    let params: string | null

    if (!url) {
        errorMsg = "Invalid URL"
        params = null
    }
    else {
        if (!url?.hostname.includes("youtube")) {
            errorMsg = "Only YouTube links supported"
            params = null
        }
        const pathname = url.searchParams.get('v') ?? url.pathname
        if (!pathname) {
            errorMsg = "Invalid URL"
            params = null;
        }
        errorMsg = ""
        if (url.searchParams.get('v'))
            params = url.searchParams.get('v')
        params = pathname.replace("/embed", "");
    }
    if (errorMsg)
        return <p> {errorMsg} </p>
    return <iframe width="560" height="315" src={`https://www.youtube.com/embed/${params}`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
}