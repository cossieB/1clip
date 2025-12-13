type Props = {
    message?: string
}

export function NotFound(props: Props) {
    return (
        <div class="">
            <h1>Not Found</h1>
            <span>{props.message ?? "Fission Mailed"}</span>
        </div>
    )
}
