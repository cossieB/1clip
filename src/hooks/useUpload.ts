import { uploadToSignedUrl } from "~/utils/uploadToSignedUrl";
import { mergeObjectArrays } from "~/lib/zip";
import { FileUploadSchema, SignedUrlResponse } from "~/integrations/storageService/zod";
import { convertToWebP } from "~/utils/convertToWebp";
import { createSignal, createStore, useContext } from "solid-js";
import { ToastContext } from "~/components/Toast/ToastProvider";
import { SignedUrlFetcher } from "~/integrations/storageService/serverFn";

export function useUpload(abortController?: AbortController) {
    const { addToast } = useContext(ToastContext)
    type Upload = {
        file: File;
        field: string;
        metadata?: Record<string, string>;
        convertedFile?: File;
    };

    const [isBusy, setIsBusy] = createSignal(false)    
    const [files, setFiles] = createStore<Upload[]>([])

    async function convertFiles() {
        setIsBusy(true)
        try {
            await Promise.allSettled(files.map(async (f, i) => {
                if (!f.file.type.startsWith("image/")) return;
                const convertedFile = await convertToWebP(f.file);
                setFiles(s => {
                    const item = s.at(i)
                    if (item) item.convertedFile = convertedFile
                })
            }))
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setIsBusy(false)
        }
    }
    async function getSignedUrls(getUrls: SignedUrlFetcher, prefix?: string) {
        if (files.length == 0) return [];
        setIsBusy(true)
        try {
            return await getUrls({
                prefix,
                files: files.map(f => ({
                    contentLength: (f.convertedFile ?? f.file).size,
                    contentType: (f.convertedFile ?? f.file).type,
                    filename: (f.convertedFile ?? f.file).name,
                    metadata: f.metadata
                }))
            })
        }
        catch (error) {
            console.error(error)
            throw new Error("Could not create your post. Upload failed")
        }
    }

    async function upload(urls: SignedUrlResponse) {
        try {
            if (files.length === 0) return [];
            setIsBusy(true)
            if (urls.length != files.length)
                throw addToast({ text: "Something went wrong. Please try again later", type: "error" })

            const promises = files.map((f, i) => uploadToSignedUrl(
                urls[i].signedUrl,
                f.convertedFile ?? f.file, {
                signal: abortController?.signal,
            }))
            await Promise.all(promises)
            return mergeObjectArrays(files, urls)
        }
        catch (error) {
            console.error(error)
            throw new Error("Could not create your post. Upload failed")
        }
        finally {
            setIsBusy(false)
        }
    }

    async function convertAndUpload(getUrls: SignedUrlFetcher, prefix?: string) {
        await convertFiles()
        const urls = await getSignedUrls(getUrls, prefix);
        return upload(urls)
    }

    return {
        upload,
        setFiles,
        isUploading: isBusy,
        files: () => files,
        getSignedUrls,
        convertFiles,
        convertAndUpload
    }
}
