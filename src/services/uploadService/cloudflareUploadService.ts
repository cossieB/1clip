import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export function uploadFromServer(file: File, prefix: string) {
    const ext = file.name.slice(file.name.lastIndexOf("."))
    const upload = new Upload({
        client: S3,
        params: {
            Bucket: "clipz",
            Key: prefix + crypto.randomUUID() + ext,
            Body: file,
            ContentType: file.type
        }
    })
    return upload.done()
}

export async function generateSignedUrl(filename: string, contentType: string, prefix: string) {
    const ext = filename.slice(filename.lastIndexOf("."))
    return await getSignedUrl(
        S3,
        new PutObjectCommand({ 
            Bucket: "clipz", 
            Key: prefix + crypto.randomUUID() + ext,
            ContentType: contentType,            
        }),{
            expiresIn: 600,
        }        
    )
}