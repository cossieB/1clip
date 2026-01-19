import { Trash2Icon } from "lucide-solid"
import { ComponentProps, splitProps } from "solid-js"
import { RenderMedia } from "./RenderMedia"

type Props = {
    url: string
    contentType: string
    onDelete(): void
} & ComponentProps<'div'>

export function ImagePreview(props: Props) {
    const [_, rest] = splitProps(props, ['url', 'onDelete'])
    return (
        <div {...rest}>
            <RenderMedia {...props} />
            <button type="button" onClick={props.onDelete} >
                <Trash2Icon />
            </button>
        </div>
    )
}