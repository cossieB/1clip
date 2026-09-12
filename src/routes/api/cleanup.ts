import { createFileRoute } from '@tanstack/solid-router'
import { truncateUserNotifications } from '~/features/notifications/notificationsRepository';

export const Route = createFileRoute('/api/cleanup')({
    server: {
        handlers: {
            POST: async ({request}) => {
                const KEY = request.headers.get("X-JANITOR-KEY")
                if (KEY != process.env.JANITOR_KEY) return new Response(null, {
                    status: 403
                })
                await truncateUserNotifications();
                return new Response()
            }
        }
    }
})