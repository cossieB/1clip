import { Show } from "solid-js"
import { getRelativeTime } from "~/lib/getRelativeTime"
import { paths } from "~/router"
import { mediaSrc } from "~/utils/mediaSrc"
import styles from "./PostAuthor.module.css"
import { UserMiniProfile } from "./MiniProfile"

type P = {
    author: {
        id: string
        username: string
        image: string
    }
    createdAt: Date
    edited?: boolean
    entityId: string | number
}

export function PostAuthor(props: P) {
    let timerId = -1
    return (
        <div
            style={{ "anchor-name": "--postAuthor" + props.entityId }}
            onMouseEnter={(e) => {
                window.clearTimeout(timerId)
                e.preventDefault()
                timerId = window.setTimeout(() => {
                    document.getElementById("post-author-popover" + props.entityId)?.showPopover()
                }, 300)
            }}
            onMouseLeave={e => {
                window.clearTimeout(timerId)
                timerId = window.setTimeout(() => {
                    document.getElementById("post-author-popover" + props.entityId)?.hidePopover()
                }, 300)
            }}
        >
            <a class={styles.author} href={paths.users(props.author.username)}>
                <img
                    class={["cutout", styles.avatar]}
                    src={mediaSrc(props.author.image)}
                    alt={props.author.username}
                    width="40"
                    height="40"
                />
                <span class={styles.names}>
                    <span class={styles.username}>@{props.author.username}</span>
                    <span class={styles.meta}>
                        <time datetime={props.createdAt.toISOString()}>
                            {getRelativeTime(props.createdAt)}
                        </time>
                        <Show when={props.edited}>
                            <span> · edited</span>
                        </Show>
                    </span>
                </span>
            </a>
            <UserMiniProfile entityId={props.entityId} userId={props.author.id} />
        </div>
    )
}
