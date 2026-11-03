import styles from "./NotFound.module.css"

type Props = {
    message?: string
}

export function NotFound(props: Props) {
    return (
        <div class={styles.nf}>
            <h1>Not Found</h1>
            <span>{props.message ?? "Fission Mailed"}</span>
        </div>
    )
}
