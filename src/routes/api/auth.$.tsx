import { createFileRoute } from '@tanstack/solid-router'
import { auth } from '~/auth/server'

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
