import { For } from "solid-js"
import styles from "./FriendsOnline.module.css"

export function FriendsOnline() {
    return (
        <section class="card">
            <h2>Friends online</h2>
            <ul class={styles.list}>
                <For each={[]}>
                    {friend => <FriendStatus
                        handle="test"
                        image="/q.png"
                        status="off"
                        activity="Playing Apex"
                    />}
                </For>
            </ul>
        </section>
    )
}

type P = {
    handle: string
    image: string
    status: "on" | "off" | "unavailable"
    activity?: string
}

function FriendStatus(props: P) {
    return (
        <li
            class={styles.li}
            data-s={props.status}
        >
            <img
                class={[styles.avatar, styles.sm]}
                src={props.image}
                alt=""
            />
            <span> {props.handle} </span>
            <small> {props.activity} </small>
        </li>
    )
}