import { createSignal, createMemo, For, useContext, Show, Loading } from "solid-js"
import styles from "./PostComposer.module.css"
import { AuthContext } from "~/features/auth/components/AuthContext";

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

export function PostComposer() {
    const [content, setContent] = createSignal("")
    const segments = createMemo(() => tokenize(content()))
    const session = useContext(AuthContext)
    return (
        <Loading>
            <Show when={session().data}>

                <section class={["card", styles.compose]} aria-label="Create post">
                    <img class={styles.avatar} src="" alt="" />

                    <div class={styles.editor}>
                        <div class={styles.backdrop} aria-hidden="true">
                            <For each={segments()}>
                                {(s) => (s.type ? <span class={styles[s.type]}>{s.text}</span> : s.text)}
                            </For>
                            {/* keeps a trailing newline from collapsing so heights stay in sync */}
                            {"\u200b"}
                        </div>
                        <textarea
                            placeholder="What did you just clutch?"
                            aria-label="Post text"
                            value={content()}
                            onInput={(e) => setContent(e.currentTarget.value)}
                            maxlength={500}
                        />
                    </div>

                    <div class={styles.row}>
                        <button>Upload</button>
                        <button>Looking for group</button>
                        <button class="primary">Post</button>
                    </div>
                </section>
            </Show>
        </Loading>
    )
}