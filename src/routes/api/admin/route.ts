import { createFileRoute } from '@tanstack/solid-router'
import { createMiddleware } from '@tanstack/solid-start'
import { getCurrentUser } from '~/services/authService'

const authorize = createMiddleware()
    .server(async ({ next }) => {
        const user = await getCurrentUser()
        if (!user || user.role !== "admin") throw new Response(null, { status: 401 })
        return next()
    })

export const Route = createFileRoute('/api/admin')({
    server: {
        middleware: [authorize],
    }
})
