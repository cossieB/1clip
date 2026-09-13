import { createStore, unwrap } from "solid-js/store";
import { uploadToSignedUrl } from "~/utils/uploadToSignedUrl";
import { useToastContext } from "./useToastContext";

export function useUpload() {
    const { addToast } = useToastContext()
    const [state, setState] = createStore({
        isUploading: false,
        files: [] as {
            file: File,
            field: string,
            objectUrl: string,
            metadata?: Record<string, string>
        }[]
    })

    async function upload(array: {signedUrl: string, metadata?: Record<string, string>}[], abortController?: AbortController) {

        try {
            if (state.files.length === 0) return;
            setState({ isUploading: true })

            if (array.length != state.files.length)
                throw addToast({ text: "Something went wrong. Please try again later", type: "error" })

            const promises = state.files.map((f, i) => uploadToSignedUrl(
                array[i].signedUrl,
                f.file, {
                signal: abortController?.signal,
                metadata: array[i].metadata
            }))
            await Promise.all(promises)
        }
        catch (error) {
            console.error(error)
            throw error
        }
        finally {
            setState({ isUploading: false })
        }
    }

    function setFiles(cb: (current: typeof state.files) => typeof state.files) {
        setState("files", prev => cb(prev))
    }

    return {
        upload,
        setFiles,
        isUploading: () => state.isUploading,
        files: () => state.files
    }
}
