import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { join } from "node:path/posix";

type Options = {
    key: string;
    contentType: string;
    contentLength: number;
    metadata?: Record<string, string>;
};

export class R2StorageService {
    private readonly client: S3Client;
    private readonly protectedKeys = [
            "users/default_banner.jpg",
            "users/default_avatar.png",
            "q.png",        
        ];
    constructor(private readonly bucket: string) {

        this.client = new S3Client({
            region: "auto",
            endpoint: process.env.CLOUDFLARE_ENDPOINT,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID!,
                secretAccessKey: process.env.SECRET_ACCESS_KEY!,
            },
        });
    }

    async uploadFromServer(
        file: File,
        ...pathSegments: [string, ...string[]]
    ) {
        const key = join(...pathSegments, file.name);

        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: file,
                ContentType: file.type,
            },
        });

        return upload.done();
    }

    generateSignedUrl = async (options: Options) => {
        const {
            contentLength,
            contentType,
            metadata,
            key,
        } = options;

        const signedUrl = await getSignedUrl(
            this.client,
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                ContentType: contentType,
                ContentLength: contentLength,
                Metadata: metadata,
            }), {
            expiresIn: 5 * 60,
            signableHeaders: new Set([
                "content-type",
                "x-amz-meta-postid",
                "x-amz-meta-userid",
            ]),
        });

        return {
            signedUrl,
            key,
        };
    }

    deleteObject = (key: string) => {
        if (this.protectedKeys.includes(key)) {
            return;
        }

        return this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            })
        );
    }

    fileExists = async (key: string) => {
        try {
            await this.client.send(
                new HeadObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                })
            );
            return true;
        }
        catch (error: any) {
            if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404)
                return false;

            throw error;
        }
    }
    moveToDeletedBucket = async (key: string) => {
        if (this.protectedKeys.includes(key)) {
            return;
        }        
        const destinationBucket = `${this.bucket}-deleted`;

        const copyCommand = new CopyObjectCommand({
            Bucket: destinationBucket,
            Key: key,
            CopySource: `${this.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`,
        });

        await this.client.send(copyCommand);

        const deleteCommand = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.client.send(deleteCommand);
    }
}
