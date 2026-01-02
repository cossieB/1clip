import { useServerFn } from "@tanstack/solid-start";
import { createStore } from "solid-js/store";
import { getPostSignedUrl } from "~/services/uploadService";
import { uploadToSignedUrl } from "~/utils/uploadToSignedUrl";

export function useUpload(
    signedUrlFn: typeof getPostSignedUrl,
    abortController?: AbortController
) {
    const getSignedUrl = useServerFn(signedUrlFn)
    const [state, setState] = createStore({
        isUploading: false,
        images: [] as (Data)[]
    })

    async function upload() {
        try {
            setState('isUploading', true)
            const promises = state.images.filter(x => !!x).map(img => uploadToSignedUrl(img.signedUrl, img.file, {signal: abortController?.signal}))
            await Promise.all(promises)
        } 
        catch (error) {
            throw error
        } 
        finally {
            setState('isUploading', false)            
        }
    }

    const setFiles = (data: Data[]) => setState({images: data})
    
    return {
        getSignedUrl,
        upload,
        setFiles,
        state
    }
}

type Data = {
    file: File,
    key: string,
    signedUrl: string
}