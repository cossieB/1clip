import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getCurrentUser } from "../authService";
import { put } from '@vercel/blob';

export async function generateClientUploadTokens(body: HandleUploadBody, request: Request) {
    try {
        const jsonResponse = await handleUpload({
            token: process.env.GG_READ_WRITE_TOKEN,
            body,
            request,
            onBeforeGenerateToken: async () => {
                const user = await getCurrentUser()
                if (!user || user.role != "admin") throw new Response(null, { status: 401 })
                return {
                    allowedContentTypes: ["image/*"],
                    tokenPayload: JSON.stringify({ userId: 1 })
                }
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log(tokenPayload)
                console.log(blob)
            },
        })
        return Response.json(jsonResponse)
    }
    catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 })
    }
}

export function uploadFromServer(file: File, path: string) {
    return put(
        path,
        file, {
        access: "public",
        token: process.env.GG_READ_WRITE_TOKEN        
    })
}