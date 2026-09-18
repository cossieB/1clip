import { Fetcher } from "@tanstack/solid-start";
import { createStore } from "solid-js/store";
import { uploadToSignedUrl } from "~/utils/uploadToSignedUrl";
import { useToastContext } from "./useToastContext";
import { mergeObjectArrays } from "~/lib/zip";
import { FileUploadSchema, SignedUrlResponse } from "~/integrations/uploadService/utils";

export function useUpload(abortController?: AbortController) {
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

    async function getSignedUrls(getUrls: Fetcher<any, typeof FileUploadSchema, Promise<SignedUrlResponse>>, prefix?: string) {
        if (state.files.length == 0) return []
        return await getUrls({
            data: {
                prefix,
                files: state.files.map(f => ({
                    contentLength: f.file.size,
                    contentType: f.file.type,
                    filename: f.file.name,
                    metadata: f.metadata
                }))
            },
            signal: abortController?.signal
        })
    }

    async function upload(urls: SignedUrlResponse) {
        try {
            if (state.files.length === 0) return [];
            setState({ isUploading: true })
            if (urls.length != state.files.length)
                throw addToast({ text: "Something went wrong. Please try again later", type: "error" })

            const promises = state.files.map((f, i) => uploadToSignedUrl(
                urls[i].signedUrl,
                f.file, {
                signal: abortController?.signal,
            }))
            await Promise.all(promises)
            return mergeObjectArrays(state.files, urls)
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
        files: () => state.files,
        getSignedUrls
    }
}
