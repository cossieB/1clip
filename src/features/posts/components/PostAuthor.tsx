import { type getPostFn } from "~/serverFn/posts"
import { STORAGE_DOMAIN } from "~/utils/env"
import { Link } from '@tanstack/solid-router'
import styles from "./Post.module.css"
import { UserMiniProfile } from "~/features/users/components/MiniProfile"

type Props = {
    post: Awaited<ReturnType<typeof getPostFn>>
}

export function PostAuthor(props: Props) {
    let timerId: number | undefined
    return (
        <>
            <div
                class={styles.user}
                id={"postAuthor"}
                onMouseEnter={(e) => {
                    window.clearTimeout(timerId)
                    e.preventDefault()
                    timerId = window.setTimeout(() => {
                        document.getElementById("post-author-popover" + props.post.postId)?.showPopover()
                    }, 300)
                }}
                onMouseLeave={e => {
                    window.clearTimeout(timerId)
                    timerId = window.setTimeout(() => {
                        document.getElementById("post-author-popover" + props.post.postId)?.hidePopover()
                    }, 300)
                }}
            >
                <div
                    style={{ "anchor-name": "--postAuthor" + props.post.postId }}
                >
                    <img src={STORAGE_DOMAIN + props.post.user.image} />
                    {props.post.user.displayUsername}
                    <Link to='/users/$username' params={{ username: props.post.user.username! }} />
                </div>
                <UserMiniProfile entityId={props.post.postId} userId={props.post.userId} />
            </div>
        </>
    )
}

