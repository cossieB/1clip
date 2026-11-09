import { createSignal, createMemo, For, Show, Loading } from "solid-js"
import styles from "./PostComposer.module.css"
import { session } from "~/features/auth/authApi";
import { mediaSrc } from "~/utils/mediaSrc";
import { Editor } from "~/components/Forms/Editor";



type Props = {
    onSubmit: (content: string) => void
}

export function PostComposer() {
    const [content, setContent] = createSignal("")
    return (
        <Loading>
            <Show when={session().data}>

                <section class={["card", styles.compose]} aria-label="Create post">
                    <img class={styles.avatar} src={mediaSrc(session().data!.user.image!)} alt="" />

                    <Editor content={content()} setContent={setContent} maxlength={500} />

                    <div class={styles.row}>
                        <button>Upload</button>
                        <button>Looking for group</button>
                        <button
                            class={["primary", styles.postBtn]}
                            onClick={() => {

                            }}
                        >
                            Post
                        </button>
                    </div>
                </section>
            </Show>
        </Loading>
    )
}