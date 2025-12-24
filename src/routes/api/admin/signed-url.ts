import { createFileRoute } from '@tanstack/solid-router'
import z from 'zod'
import { generateSignedUrl } from '~/services/uploadService/cloudflareUploadService'

const Body = z.object({
    filename: z.string(),
    contentType: z.string(),
    prefix: z.string()
})

export const Route = createFileRoute('/api/admin/signed-url')({
    validateSearch: Body,
    server: {
        handlers: {
            GET: async ({ request }) => {
                if (request.headers.get("Content-Type") != "application/json") 
                    throw new Response(null, {status: 415})
                const body = await request.json()
                const data = Body.parse(body)
                const url = await generateSignedUrl(data.filename, data.contentType, data.prefix)
                return Response.json({ url })
            }
        }
    }
})