import z from "zod";
import { storageService } from "~/integrations/storageService/index.server";
import { generateUniqueFilename } from "~/utils/mediaSrc";
import { FileUploadSchema } from "./zod";
import { orphanedFileService } from "~/services/orphanedFileService";

export type PendingUpload = {
    userId: string
    reference: string | number
    key: string
}

export async function generateAndStoreSignedUrls(data: z.infer<typeof FileUploadSchema>, userId: string, prefix: string) {
    const urls = await Promise.all(
        data.files.map((f) =>
            storageService.generateSignedUrl({
                contentLength: f.contentLength,
                contentType: f.contentType,
                key: `${prefix}/${generateUniqueFilename(f.filename)}`,
            })
        )
    )
    await orphanedFileService.storePendingUploads(urls, userId);
    return urls
}
