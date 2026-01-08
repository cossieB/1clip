import { mediaSrc } from "~/utils/mediaSrc";
import { UploadBox } from "./UploadBox"
import styles from "./UploadBox.module.css"

type Props = {
    image: string
    onDrop: (item: {
        objectUrl: string;
        file: File;
    }) => void
}

export function UploadBoxWithPreview(props: Props) {
    return (
        <div class={styles.upload}>
            <UploadBox
                accept={{
                    image: true,
                    video: false,
                    audio: false
                }}
                label="Logo"
                limit={1}
                maxSize={5}
                onSuccess={data => {
                    const a = data[0]
                    props.onDrop(a)
                }}
            />
            <div class={styles.preview}>
                <img src={mediaSrc(props.image)} />
            </div>
        </div>
    )
}