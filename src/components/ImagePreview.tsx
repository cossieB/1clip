import { Trash2Icon } from "lucide-solid"
import { ComponentProps, splitProps } from "solid-js"

type Props = {
    img: string
    onDelete(): void
} & ComponentProps<'div'>

export function ImagePreview(props: Props) {
    const [_, rest] = splitProps(props, ['img', 'onDelete'])
    return (
        <div
            {...rest}            
        >
            <img src={props.img} />
            <button type="button" onClick={props.onDelete} >
                <Trash2Icon />
            </button>
        </div>
    )
}