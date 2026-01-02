import { UploadIcon } from "lucide-solid"
import { useToastContext } from "~/hooks/useToastContext"
import styles from "./UploadBox.module.css"
import { ComponentProps, mergeProps, onCleanup, splitProps } from "solid-js"
import { MIME_TYPES } from "~/utils/MIME"

type P = {
    label: string
    onSuccess: (items: { objectUrl: string, file: File }[]) => void
    /**in MB */
    maxSize: number
    limit: number
    accept: {
        image: boolean,
        video: boolean,
        audio: boolean
    }
} & ComponentProps<"div">

export function UploadBox(props: P) {
    let inputRef!: HTMLInputElement
    const [_, divProps] = splitProps(props, ['onSuccess', "maxSize", "limit", "accept"])
    const { addToast } = useToastContext()
    const objectUrls: string[] = []

    const accepts = Object.entries(props.accept).reduce((acc, curr) => {
        const [type, bool] = curr as [keyof typeof MIME_TYPES, boolean]
        if (bool) return [...acc, ...MIME_TYPES[type]]
        return acc
    }, [] as string[])

    onCleanup(() => {
        objectUrls.forEach(url => URL.revokeObjectURL(url))
    })

    function processFiles(fileList: FileList) {
        const files: { objectUrl: string, file: File }[] = [];
        for (const file of fileList) {
            if (file.size > props.maxSize * 1024 * 1024) {
                addToast({ text: `File too big: ${file.name}`, type: "warning", autoFades: true })
                continue
            };
            if (!accepts.includes(file.type.toLowerCase())) {
                addToast({ text: `Invalid format: ${file.name}`, type: "warning", autoFades: true })
                continue;
            };
            const objectUrl = URL.createObjectURL(file)
            objectUrls.push(objectUrl)
            files.push({ objectUrl, file })
            if (files.length === props.limit) break;
        }
        props.onSuccess(files)
    }

    return (
        <div
            {...divProps}
            class={styles.uploadBox}
            onDragOver={e => {
                e.preventDefault()
            }}
            ondrop={async e => {
                e.preventDefault()
                if (!e.dataTransfer) return
                const fileList = e.dataTransfer.files
                processFiles(fileList)
            }}
        >
            <label>{props.label}</label>
            <button style={{ "all": "unset" }} type="button" onclick={() => inputRef.click()} >
                <UploadIcon />
            </button>
            <span>MAX: {props.maxSize} MB</span>
            <input
                ref={inputRef}
                type="file"
                hidden
                accept={accepts.join(",")}
                multiple={props.limit > 1}
                onchange={e => {
                    if (e.currentTarget.files)
                        processFiles(e.currentTarget.files)
                }}
            />
        </div>
    )
}