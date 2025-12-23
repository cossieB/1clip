import { createFileRoute } from '@tanstack/solid-router'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import * as vercelUploadService from '~/services/uploadService/vercelUploadService';

export const Route = createFileRoute('/api/upload/admin')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const body = await request.json() as HandleUploadBody;
                return vercelUploadService.generateClientUploadTokens(body, request)
            }
        }
    }
})

