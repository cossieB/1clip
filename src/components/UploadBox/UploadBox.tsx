import { UploadIcon } from "lucide-solid"
import { useToastContext } from "~/hooks/useToastContext"
import styles from "./UploadBox.module.css"
import { upload } from "@vercel/blob/client"
import { onCleanup } from "solid-js"

type P = {
    label: string
    onSuccess: (objectUrl: string, file: File) => void
    /**in MB */
    maxSize: number
}

export function UploadBox(props: P) {
    const { addToast } = useToastContext()
    const objectUrls: string[] = []

    onCleanup(() => {
        objectUrls.forEach(url => URL.revokeObjectURL(url))
    })

    return (
        <div
            class={styles.uploadBox}            
            onDragOver={e => {
                e.preventDefault()
                if (!e.dataTransfer) return
                const file = e.dataTransfer.files.item(0)
                if (!file) return
            }}
            ondrop={async e => {
                e.preventDefault()
                if (!e.dataTransfer) return
                const file = e.dataTransfer.files.item(0)
                if (!file) return
                if (!file.type.startsWith("image"))
                    return addToast({ text: "Invalid Image", type: "error" })
                if (file.size > props.maxSize * 1024 * 1024)
                    return addToast({ text: "Image too large", type: "error" })
                
                const objUrl = URL.createObjectURL(file)
                props.onSuccess(objUrl, file)
                objectUrls.push(objUrl)

            }}
        >
            <label>{props.label}</label>
            <UploadIcon />
            <span>MAX: {props.maxSize} MB</span>
        </div>
    )
}