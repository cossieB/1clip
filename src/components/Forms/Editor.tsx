import { createMemo, createSignal, For, Setter, SourceAccessor } from "solid-js";
import styles from "./Editor.module.css"

export const TOKEN_REGEX = /(?<hash>(?<=^|\s)#\w+\b)|(?<mention>(?<=^|\s)@[A-Za-z]\w{2,14}\b)|(?<url>https?:\/\/\S+)/g

type Segment = { text: string; type?: "hash" | "mention" | "url" }

function tokenize(input: string): Segment[] {
    const out: Segment[] = []
    let last = 0
    for (const m of input.matchAll(TOKEN_REGEX)) {
        const start = m.index!
        if (start > last) out.push({ text: input.slice(last, start) })
        const type = (m.groups!.hash ? "hash" : m.groups!.mention ? "mention" : "url") as Segment["type"]
        out.push({ text: m[0], type })
        last = start + m[0].length
    }
    if (last < input.length) out.push({ text: input.slice(last) })
    return out
}

type Props = {
    content: SourceAccessor<string>
    setContent: Setter<string>
    maxlength: number
    placeholder?: string
}

export function Editor(props: Props) {
    const segments = createMemo(() => tokenize(props.content()))    
    return (
        <div aria-role="group" class={styles.editor}>
            <div class={styles.backdrop} aria-hidden="true">
                <For each={segments()}>
                    {(s) => (s.type ? <span class={styles[s.type]}>{s.text}</span> : s.text)}
                </For>
                {/* keeps a trailing newline from collapsing so heights stay in sync */}
                {"\u200b"}
            </div>
            <textarea
                placeholder={props.placeholder ?? "What did you just clutch?"}
                aria-label="Post text"
                value={props.content()}
                onInput={(e) => props.setContent(e.currentTarget.value)}
                maxlength={props.maxlength}
            />
        </div>
    )
}