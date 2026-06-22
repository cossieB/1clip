import styles from "./NotFound.module.css"
import { MySiteTitle } from "../MySiteTitle"

type Props = {
    message?: string
}

export function NotFound(props: Props) {
    return (
        <div class={styles.nf}>
            <MySiteTitle>Not Found</MySiteTitle>
            <h1>Not Found</h1>
            <span>{props.message ?? "Fission Mailed"}</span>
        </div>
    )
}
