import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { join } from "node:path/posix";

const S3 = new S3Client({
    region: "auto", // Required by SDK but not used by R2
    // Provide your Cloudflare account ID
    endpoint: process.env.CLOUDFLARE_ENDPOINT,
    // Retrieve your S3 API credentials for your R2 bucket via API tokens (see: https://developers.cloudflare.com/r2/api/tokens)
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
});

export function uploadFromServer(file: File, ...pathSegments: string[]) {
    const key = join(...pathSegments, file.name)
    const upload = new Upload({
        client: S3,
        params: {
            Bucket: "clipz",
            Key: key,
            Body: file,
            ContentType: file.type
        }
    })
    return upload.done()
}

export async function generateSignedUrl(filename: string, contentType: string, contentLength: number, pathSegments: string[], metadata?: Record<string, string>) {
    const ext = filename.slice(filename.lastIndexOf("."))
    const key = join(...pathSegments, crypto.randomUUID() + ext)
    const signedUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({
            Bucket: "clipz",
            Key: key,
            ContentType: contentType,
            ContentLength: contentLength,
            Metadata: metadata,            
        }), {
        expiresIn: 5 * 60,
    })
    return {signedUrl, key}
}

export function deleteObject(key: string) {
    return S3.send(new DeleteObjectCommand({
        Bucket: "clipz",
        Key: key,
    }))
}