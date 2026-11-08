import { Element, Show, createSignal, createUniqueId, onSettled } from "solid-js"
import styles from "./PostContent.module.css"
import { TOKEN_REGEX } from "~/components/Forms/Editor"

const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/

function renderContent(content: string): Element[] {
    const nodes: Element[] = []
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
            nodes.push(
                <a class={styles.link} href={`/posts/?tag=${raw.slice(1)}`}>
                    {raw}
                </a>,
            )
        } else if (match.groups?.mention) {
            const raw = match.groups.mention
            nodes.push(
                <a class={styles.link} href={`/users/${raw.slice(1)}`}>
                    {raw}
                </a>,
            )
        } else if (match.groups?.url) {
            // "see https://example.com." shouldn't swallow the full stop
            const raw = match.groups.url
            const trailing = TRAILING_PUNCTUATION.exec(raw)?.[0] ?? ""
            const url = trailing ? raw.slice(0, -trailing.length) : raw
            nodes.push(
                <a class={styles.link} href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                </a>,
            )
            if (trailing) nodes.push(trailing)
        }

        lastIndex = index + match[0].length
    }

    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex))
    }

    return nodes
}

type Props = {
    content: string
    collapsedLines?: number // default 6
}

export function PostContent(props: Props) {
    const id = createUniqueId()
    const [expanded, setExpanded] = createSignal(false)
    const [overflowing, setOverflowing] = createSignal(false)
    let el!: HTMLDivElement

    // Measure after mount. The server renders collapsed, so there's no hydration mismatch;
    // the button simply appears once we know the text is actually clipped.
    onSettled(() => {
        const measure = () => {
            if (expanded()) return
            setOverflowing(el.scrollHeight > el.clientHeight + 1)
        }
        measure()

        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => observer.disconnect()
    })

    return (
        <div class={styles.root}>
            <div
                id={id}
                ref={el}
                class={[
                    styles.content,
                    {
                        [styles.clamped]: !expanded(),
                        [styles.fade]: !expanded() && overflowing(),
                    },
                ]}
                style={{ "--lines": props.collapsedLines ?? 6 }}
            >
                {renderContent(props.content)}
            </div>

            <Show when={overflowing()}>
                <button
                    type="button"
                    class={["ghost", styles.toggle]}
                    // aria-expanded={expanded()}
                    aria-controls={id}
                    onClick={() => setExpanded(v => !v)}
                >
                    {expanded() ? "Show less" : "Show more"}
                </button>
            </Show>
        </div>
    )
}