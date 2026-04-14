import { type getPostFn } from "~/serverFn/posts"
import { STORAGE_DOMAIN } from "~/utils/env"
import { Link } from '@tanstack/solid-router'
import { MenuPopover } from "~/components/Popover/MenuPopover"
import { createSignal, onCleanup, onMount, Show, Suspense } from "solid-js"
import { useQuery } from "@tanstack/solid-query"
import { userQueryOpts } from "~/features/users/utils/userQueryOpts"
import { UserRank } from "~/components/UserRank"
import styles from "./Post.module.css"
import { FollowBtn } from "~/features/users/components/UserPage"
import { LoaderIcon } from "lucide-solid"

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
                <UserMiniProfile {...props} />
            </div>
        </>
    )
}

function UserMiniProfile(props: Props) {
    let elem!: HTMLDivElement
    const [enabled, setEnabled] = createSignal(false)
    const result = useQuery(() => ({
        ...userQueryOpts(props.post.userId),
        enabled: enabled()
    }))
    const listener = (event: ToggleEvent) => {
        if (event.newState == "open") {
            setEnabled(true)
        }
    }
    onMount(() => {
        elem.addEventListener("toggle", listener)
        onCleanup(() => {
            elem.removeEventListener("toggle", listener)
        })
    })
    return (
        <MenuPopover
            id={"post-author-popover" + props.post.postId}
            style={{ "position-anchor": "--postAuthor" + props.post.postId, "position-area": "center right" }}
            ref={elem}
            //@ts-expect-error
            popover="hint"
        >
            <Suspense
                fallback={
                    <section class={`${styles.miniProfile} ${styles.wait}`}>
                        <LoaderIcon />
                    </section>
                }
            >
                <section class={styles.miniProfile} style={{ "background-image": `url(${STORAGE_DOMAIN + result.data?.banner})` }}>
                    <section >
                        <img src={STORAGE_DOMAIN + result.data?.image} alt="" />
                        <Show when={result.data}>
                            {user => <FollowBtn user={user()} />}
                        </Show>

                    </section>
                    <section class={styles.rank}>
                        {result.data?.displayName}
                        <UserRank userId={props.post.userId} enabled={enabled()} />
                    </section>
                </section>
            </Suspense>
        </MenuPopover>
    )
}