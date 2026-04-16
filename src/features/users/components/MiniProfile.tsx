import { useQuery } from "@tanstack/solid-query"
import { LoaderIcon } from "lucide-solid"
import { createSignal, onMount, onCleanup, Suspense, Show, createEffect } from "solid-js"
import { MenuPopover } from "~/components/Popover/MenuPopover"
import { UserRank } from "~/components/UserRank"
import { STORAGE_DOMAIN } from "~/utils/env"
import { userQueryOpts } from "../utils/userQueryOpts"
import { FollowBtn } from "./UserPage"
import styles from "./MiniProfle.module.css"

type Props = {
    entityId: string | number
    userId: string
}

export function UserMiniProfile(props: Props) {
    let elem!: HTMLDivElement
    let el!: HTMLElement
    const [enabled, setEnabled] = createSignal(false)
    const result = useQuery(() => ({
        ...userQueryOpts(props.userId),
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
            id={"post-author-popover" + props.entityId}
            style={{ "position-anchor": "--postAuthor" + props.entityId, "position-area": "center right" }}
            ref={elem}
            //@ts-expect-error
            popover="hint"
        >
            <section ref={el} class={styles.miniProfile}>
                <Suspense
                    fallback={
                        <div class={`${styles.wait}`} >
                            <LoaderIcon />
                        </div>
                    }
                >
                    <section >
                        <img src={STORAGE_DOMAIN + result.data?.image} alt="" />
                        <Show when={result.data}>
                            {user => <FollowBtn user={user()} />}
                        </Show>

                    </section>
                    <section class={styles.rank}>
                        {result.data?.displayName}
                        <UserRank userId={props.userId} enabled={enabled()} />
                    </section>
                    <img class={styles.bg} src={STORAGE_DOMAIN + result.data?.banner} alt="" />
                    <div class={styles.shade} />
                </Suspense>
            </section>
        </MenuPopover>
    )
}