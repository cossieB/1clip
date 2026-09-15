import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { join } from "node:path/posix";
import { generateUniqueFilename } from "~/utils/mediaSrc";

const BUCKET = "clipz"

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
            Bucket: BUCKET,
            Key: key,
            Body: file,
            ContentType: file.type
        }
    })
    return upload.done()
}

type Options = {
    key: string
    contentType: string;
    contentLength: number;
    metadata?: Record<string, string>;
};

export async function generateSignedUrl(options: Options) {
    const { contentLength, contentType, metadata, key } = options
    const signedUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType,
            Metadata: metadata,
        }), {
        expiresIn: 5 * 60,
        signableHeaders: new Set(["content-type", 'x-amz-meta-postid', 'x-amz-meta-userid']),
    });
    return { signedUrl, key }
}

export function deleteObject(key: string) {
    if (["users/default_banner.jpg", "users/default_avatar.png"].includes(key)) return
    return S3.send(new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    }))
}

export async function fileExistsInR2(key: string) {
    try {
        await S3.send(
            new HeadObjectCommand({
                Bucket: BUCKET,
                Key: key,
            })
        );
        return true;
    } 
    catch (error: any) {

        if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
            return false;
        }
        throw error;
    }
}


export async function createFileDetails(file: { size: number; contentType: string; filename: string; } | undefined, ...prefix: [string, ...string[]]) {
    return file ? await generateSignedUrl({
        contentLength: file.size,
        contentType: file.contentType,
        key: join(...prefix, generateUniqueFilename(file.filename))
    }) : undefined
}