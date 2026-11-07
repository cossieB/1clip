import { httpStatus } from "@solidjs/web"
import styles from "./NotFound.module.css"

type Props = {
    message?: string
}

export function NotFound(props: Props) {
    httpStatus(404)
    return (
        <div class={styles.nf}>
            <h1>Not Found</h1>
            <span>{props.message ?? "Fission Mailed"}</span>
        </div>
    )
}

export function Problem() {
    httpStatus(500)
    return (
        <div>
            <span>Something Went Wrong</span>
            <a href="/">Home</a>
            <button onClick={() => location.reload()}>Reload</button>
        </div>
    )
}