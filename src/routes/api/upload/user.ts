import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/api/upload/user')({
    server: {
        handlers: {
            POST: async ({request}) => {
                const fd = await request.formData();
                console.log (fd)
                return new Response()
            }
        }
    }
})

