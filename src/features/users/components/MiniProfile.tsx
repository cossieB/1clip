import { createSignal, Show, Loading, createMemo } from "solid-js"
import styles from "./MiniProfle.module.css"
import { Spinner } from "~/components/Loader/Spinner"
import { getUserFn } from "../userApi"
import { mediaSrc } from "~/utils/mediaSrc"
import { FollowBtn } from "./FollowBtn"
import { UserRank } from "./UserRank"
import { session } from "~/features/auth/authApi"
import { Popover } from "~/components/Popover/Popover"

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
            <section ref={el} class={styles.miniProfile}>
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
                            <>
                                <section >
                                    <img src={mediaSrc(user().image)} alt="" />
                                    <Show when={session().data && session().data!.user.id != props.userId}>
                                        <FollowBtn
                                            isFollowing={!!user().isFollowing}
                                            targetUserId={user().id}
                                        />
                                    </Show>
                                </section>
                                <section class={styles.rank}>
                                    {user().displayName}
                                    <UserRank userId={props.userId} enabled={enabled} />
                                </section>
                                <img class={styles.bg} src={mediaSrc(user().banner)} alt="" />
                                <div class={styles.shade} />
                            </>
                        )}
                    </Show>
                </Loading>
            </section>
        </Popover>
    )
}