import { parseVideoUrl } from "~/components/embeds/IframeFactory"
import { TOKEN_REGEX } from "../components/PostContent"

export type PostTokens = {
    hashtags: string[]
    mentions: string[]
    link: string | null
}

const trimUrl = (url: string) => url.replace(/[.,!?;:)\]}'"]+$/, "")

export function extractTokens(text: string): PostTokens {
    const hashtags = new Set<string>()
    const mentions = new Set<string>()
    let link: string | null = null

    for (const m of text.matchAll(TOKEN_REGEX)) {
        const { hash, mention, url } = m.groups!
        if (hash) hashtags.add(hash.slice(1).toLowerCase())
        else if (mention) mentions.add(mention.slice(1))
        else if (url && !link) link = trimUrl(url)
    }

    return { hashtags: [...hashtags], mentions: [...mentions], link }
}

export function extractFirstVideo(text: string) {
    for (const m of text.matchAll(TOKEN_REGEX)) {
        const url = m.groups?.url
        if (!url) continue
        try {
            const video = parseVideoUrl(new URL(trimUrl(url)))
            if (video) return { url: trimUrl(url), platform: video[0], id: video[1] }
        }
        catch {

        }
    }
    return null
}