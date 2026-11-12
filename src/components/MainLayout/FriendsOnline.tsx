import { createEffect, createMemo, For, Loading } from "solid-js"
import styles from "./FriendsOnline.module.css"
import { getOnlineUsers } from "~/features/users/userApi"
import z from "zod"
import { mediaSrc } from "~/utils/mediaSrc"
import { UserListSkeleton } from "../Skeletons/Skeletons"

export function UsersOnline() {
    const usersOnline = createMemo(() => getOnlineUsers(), { ssrSource: "client" })
    createEffect(usersOnline, u => console.log(u))
    return (
        <section class="card">
            <h2>Online</h2>
            <ul class={styles.list}>
                <Loading fallback={<UserListSkeleton />}>
                    <For each={usersOnline()}>
                        {user => <FriendStatus
                            handle={z.string().catch("Anon").parse(user.username)}
                            image={z.string().catch("users/anon.webp").parse(user.image)}
                            activity={z.string().catch("In Lobby").parse(user.title)}
                        />}
                    </For>
                </Loading>
            </ul>
        </section>
    )
}

type P = {
    handle: string
    image: string
    activity?: string
}

function FriendStatus(props: P) {
    return (
        <li class={styles.li}>
            <img
                class={[styles.avatar, styles.sm]}
                src={mediaSrc(props.image)}
                alt=""
            />
            <span> {props.handle} </span>
            <small> {props.activity} </small>
        </li>
    )
}