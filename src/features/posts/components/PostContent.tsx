import { Link } from "@tanstack/solid-router"
import { JSX } from "solid-js"
import styles from "./Post.module.css"

export const TOKEN_REGEX = /(?<hash>(?<=^|\s)#\w+\b)|(?<mention>(?<=^|\s)@[A-Za-z]\w{2,14}\b)|(?<url>https?:\/\/\S+)/g

function renderContent(content: string): JSX.Element[] {
    const nodes: JSX.Element[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    TOKEN_REGEX.lastIndex = 0

    while ((match = TOKEN_REGEX.exec(content)) !== null) {
        const { index } = match

        if (index > lastIndex) {
            nodes.push(content.slice(lastIndex, index))
        }

        if (match.groups?.hash) {
            const raw = match.groups.hash
            const tag = raw.slice(1)
            nodes.push(
                <Link to="/posts/tags/$tag" params={{ tag }}>
                    {raw}
                </Link>,
            )
        } 
        else if (match.groups?.mention) {
            const raw = match.groups.mention
            const username = raw.slice(1)
            nodes.push(
                <Link to="/users/$username" params={{ username }}>
                    {raw}
                </Link>,
            )
        } 
        else if (match.groups?.url) {
            const url = match.groups.url
            nodes.push(
                <a href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                </a>
            )
        }

        lastIndex = index + match[0].length
    }

    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex))
    }

    return nodes
}

export function PostContent(props: {content: string}) {
    return <div class={styles.main}>{renderContent(props.content)}</div>
}