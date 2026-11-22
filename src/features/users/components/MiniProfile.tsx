import { createSignal, Show, Loading, createMemo } from "solid-js"
import styles from "./MiniProfle.module.css"
import { Spinner } from "~/components/Loader/Spinner"
import { getUserFn } from "../userApi"
import { mediaSrc } from "~/utils/mediaSrc"
import { FollowBtn } from "./FollowBtn"
import { session } from "~/features/auth/authApi"
import { Popover } from "~/components/Popover/Popover"
import { UserRank } from "~/features/challenges/components/UserRank"

type Props = {
    entityId: string | number
    userId: string
}

export function UserMiniProfile(props: Props) {
    let elem!: HTMLDivElement
    let el!: HTMLElement
    const [enabled, setEnabled] = createSignal(false)

    const user = createMemo(() => enabled() ? getUserFn({ id: props.userId }) : undefined)

    return (
        <Popover
            id={"post-author-popover" + props.entityId}
            style={{ "position-anchor": "--postAuthor" + props.entityId, }}
            ref={elem}
            popover="auto"
            variant="anchored"
            onToggle={e => {
                if (e.newState == "open") setEnabled(true)
            }}

        >
            <section ref={el} class={styles.container}>
                <Loading
                    on={enabled()}
                    fallback={
                        <div class={styles.wait} >
                            <Spinner />
                        </div>
                    }
                >
                    <Show when={user()}>
                        {user => (
                            <div class={styles.miniProfile}>
                                <img class={styles.banner} src={mediaSrc(user().banner)} alt="" aria-hidden="true" />
                                <img class={styles.avatar} src={mediaSrc(user().image)} alt="" />
                                <div class={styles.name}>
                                    <span>{user().displayName}</span>
                                    <span> @{user().displayUsername} </span>
                                </div>
                                <UserRank xp={user().xp} detail />
                                <Show when={session().data && session().data!.user.id != props.userId}>
                                    <FollowBtn
                                        isFollowing={!!user().isFollowing}
                                        targetUserId={user().id}
                                    />
                                </Show>
                            </div>
                        )}
                    </Show>
                </Loading>
            </section>
        </Popover>
    )
}