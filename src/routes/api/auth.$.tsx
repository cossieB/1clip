import { createFileRoute } from '@tanstack/solid-router'
import { auth } from '~/utils/auth'

export const Route = createFileRoute('/api/auth/$')({
    server: {
        handlers: {
            GET: async ({request}) => {
                return auth.handler(request)
            },
            POST: async ({request}) => {
                return auth.handler(request)
            }
        }
    }
})
