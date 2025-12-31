import {marked} from "marked"
import DOMPurify, { Config } from "dompurify"

export async function sanitizeText(str: string) {
    const m = marked(str) as string
    if (typeof window != "undefined") {
        return DOMPurify().sanitize(m, config)
    }
    const {JSDOM} = await import("jsdom")
    const wind = new JSDOM("").window
    return DOMPurify(wind).sanitize(m, config)
}

const config: Config = {
    ALLOWED_ATTR: ["src", "href", "alt"],
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'img']
}