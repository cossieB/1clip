export function Toast(props: {message: string}) {
    return (
        <div popover="manual">
            {props.message}
        </div>
    )
}