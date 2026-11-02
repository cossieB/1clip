import { createEffect, createMemo, Loading, Show, useContext } from "solid-js"
import styles from "./UserNavItem.module.css"
import { AuthContext } from "./AuthContext"

export function UserNavItem() {
    const session = useContext(AuthContext)

    return (
        <Loading>
            <Show
                when={session().data}
            >
                <div class={styles.me}>
                    <img class={styles.avatar} style="--h:150" data-s="on" src={"/q.png"} />
                    <div><b>KiloZero</b><small>In lobby · Valorant</small></div>
                </div>
            </Show>
        </Loading>
    )
}