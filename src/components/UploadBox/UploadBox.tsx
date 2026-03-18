import { UploadIcon } from "lucide-solid"
import { useToastContext } from "~/hooks/useToastContext"
import styles from "./UploadBox.module.css"
import { ComponentProps, mergeProps, onCleanup, splitProps } from "solid-js"

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
        const [type, bool] = curr 
        if (bool) return [...acc, type + "/*"]
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
            const type = file.type.slice(0, file.type.lastIndexOf("/")) as keyof typeof props.accept
            if (!props.accept[type]) {
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
                e.preventDefault();
                e.currentTarget.classList.add(styles.dragover)
            }}
            ondrop={async e => {
                e.preventDefault()
                e.currentTarget.classList.remove(styles.dragover)
                if (!e.dataTransfer) return
                const fileList = e.dataTransfer.files
                processFiles(fileList)
            }}
            onDragLeave={e => {
                e.currentTarget.classList.remove(styles.dragover)
            }}
        >
            <label>{props.label}</label>
            <button style={{ "all": "unset" }} type="button" onclick={() => inputRef.click()} >
                <UploadIcon />
            </button>
            <span>MAX: {props.maxSize} MB</span>
            <span>
                {Object.entries(props.accept).reduce((acc, [key, bool]) => {
                    if (bool) {
                        acc.push(key);
                    }
                    return acc
                }, [] as string[]).join(", ")}
            </span>
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