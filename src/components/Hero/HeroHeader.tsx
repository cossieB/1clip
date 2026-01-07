import styles from "./HeroHeader.module.css"

type P = {
    label: string
    banner: string
    viewTransitionName: string
    image: string
}

export function HeroHeader(props: P) {
    return (
        <div class={styles.header}>
            <h1 class={`${styles.title}`}>{props.label}</h1>
            <div class={styles.hero}>
                <img src={props.banner} alt="" />
            </div>
            <div class={`${styles.cover} cutout-wrapper`}>
                <img
                    style={{ "view-transition-name": props.viewTransitionName }}
                    class={`cutout`}
                    src={props.image} alt=""
                />
            </div>
        </div>
    )
}