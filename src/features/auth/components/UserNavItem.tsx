import styles from "./UserNavItem.module.css"

export function UserNavItem() {
    return (
        <div class={styles.me}>
            <img class={styles.avatar} style="--h:150" data-s="on" src={"/q.png"} />
            <div><b>KiloZero</b><small>In lobby · Valorant</small></div>
        </div>
    )
}