import { useServerFn } from "@tanstack/solid-start";
import { createStore } from "solid-js/store";
import { getSignedUrls } from "~/services/uploadService";
import { uploadToSignedUrl } from "~/utils/uploadToSignedUrl";
import { useToastContext } from "./useToastContext";
import { mergeObjectArrays, zip } from "~/lib/zip";

export function useUpload(
    pathSegments: string[],
    abortController?: AbortController
) {
    const getUrls = useServerFn(getSignedUrls)
    const {addToast} = useToastContext()
    const [state, setState] = createStore({
        isUploading: false,
        files: [] as {file: File, field: string, objectUrl: string}[]
    })

    async function upload() {
        try {
            if (state.files.length === 0) return [];
            setState('isUploading', true)
            const urls = await getUrls({data: {
                paths: pathSegments,
                files: state.files.map(f =>  ({
                    contentLength: f.file.size,
                    contentType: f.file.type,
                    filename: f.file.name
                }))
            }})
            if (urls.length != state.files.length) 
                throw addToast({text: "Something went wrong. Please try again later", type: "error"})

            const promises = state.files.map((f, i) => uploadToSignedUrl(urls[i].signedUrl, f.file, {signal: abortController?.signal}))
            await Promise.all(promises)
            return mergeObjectArrays(state.files, urls)
        } 
        catch (error) {
            throw error
        } 
        finally {
            setState('isUploading', false)            
        }
    }
    type T = Parameters<typeof setState>
    const setFiles = (files: typeof state.files | ((prev: typeof state.files) => typeof state.files)) => setState('files', files)
    
    return {
        upload,
        setFiles,
        isUploading: () => state.isUploading,
        files: () => state.files
    }
}
