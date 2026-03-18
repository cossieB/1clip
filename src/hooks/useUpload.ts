import { useServerFn } from "@tanstack/solid-start";
import { createStore } from "solid-js/store";
import { getSignedUrls } from "~/integrations/uploadService";
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
        files: [] as {
            file: File, 
            field: string, 
            objectUrl: string,
            metadata?: Record<string, string>
        }[]
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
                    filename: f.file.name,
                    metadata: f.metadata
                }))
            }})
            if (urls.length != state.files.length) 
                throw addToast({text: "Something went wrong. Please try again later", type: "error"})

            const promises = state.files.map((f, i) => uploadToSignedUrl(
                urls[i].signedUrl, 
                f.file, 
                {
                    signal: abortController?.signal,
                }
            ))
            await Promise.all(promises)
            return mergeObjectArrays(state.files, urls)
        } 
        catch (error) {
            console.error(error)
            throw error
        }
        finally {
            setState('isUploading', false)
        }
    }

    function setFiles(files: typeof state.files): void;
    function setFiles(files: ((prev: typeof state.files) => typeof state.files)): void;
    function setFiles (i: number, file: Partial<typeof state.files[number]>): void;

    function setFiles(arg1: number | typeof state.files | ((prev: typeof state.files) => typeof state.files), file?: Partial<typeof state.files[number]>) {
        if (typeof arg1 === "object" || typeof arg1 == "function") {
            return setState('files', arg1)
        }
        if (!file) throw new Error("File argument not provided");
        return setState('files', arg1, prev => ({...prev, ...file}))
    }

    
    return {
        upload,
        setFiles,
        isUploading: () => state.isUploading,
        files: () => state.files
    }
}
