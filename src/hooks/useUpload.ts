import { Fetcher } from "@tanstack/solid-start";
import { createStore } from "solid-js/store";
import { uploadToSignedUrl } from "~/utils/uploadToSignedUrl";
import { useToastContext } from "./useToastContext";
import { mergeObjectArrays } from "~/lib/zip";
import { FileUploadSchema, SignedUrlResponse } from "~/integrations/storageService/zod";
import { convertToWebP } from "~/utils/convertToWebp";

export function useUpload(abortController?: AbortController) {
    const { addToast } = useToastContext()
    const [state, setState] = createStore({
        isBusy: false,
        files: [] as {
            file: File,
            field: string,
            objectUrl: string,
            metadata?: Record<string, string>,
            convertedFile?: File
        }[]
    })
    async function convertFiles() {
        setState({ isBusy: true })
        try {
            await Promise.allSettled(state.files.map(async (f, i) => {
                if (!f.file.type.startsWith("image/")) return;
                const convertedFile = await convertToWebP(f.file);
                setState('files', i, 'convertedFile', convertedFile)
            }))
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setState({ isBusy: false })
        }
    }
    async function getSignedUrls(getUrls: Fetcher<any, typeof FileUploadSchema, Promise<SignedUrlResponse>>, prefix?: string) {
        if (state.files.length == 0) return [];
        setState({ isBusy: true })
        try {
            return await getUrls({
                data: {
                    prefix,
                    files: state.files.map(f => ({
                        contentLength: (f.convertedFile ?? f.file).size,
                        contentType: (f.convertedFile ?? f.file).type,
                        filename: (f.convertedFile ?? f.file).name,
                        metadata: f.metadata
                    }))
                },
                signal: abortController?.signal
            })
        }
        catch (error) {
            console.error(error)
            throw new Error("Could not create your post. Upload failed")
        }
    }

    async function upload(urls: SignedUrlResponse) {
        try {
            if (state.files.length === 0) return [];
            setState({ isBusy: true })
            if (urls.length != state.files.length)
                throw addToast({ text: "Something went wrong. Please try again later", type: "error" })

            const promises = state.files.map((f, i) => uploadToSignedUrl(
                urls[i].signedUrl,
                f.convertedFile ?? f.file, {
                signal: abortController?.signal,
            }))
            await Promise.all(promises)
            return mergeObjectArrays(state.files, urls)
        }
        catch (error) {
            console.error(error)
            throw new Error("Could not create your post. Upload failed")
        }
        finally {
            setState({ isBusy: false })
        }
    }

    function setFiles(cb: (current: typeof state.files) => typeof state.files) {
        setState("files", prev => cb(prev))
    }

    async function convertAndUpload(getUrls: Fetcher<any, typeof FileUploadSchema, Promise<SignedUrlResponse>>, prefix?: string) {
        await convertFiles()
        const urls = await getSignedUrls(getUrls, prefix);
        return upload(urls)
    }

    return {
        upload,
        setFiles,
        isUploading: () => state.isBusy,
        files: () => state.files,
        getSignedUrls,
        convertFiles,
        convertAndUpload
    }
}
