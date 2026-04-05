import { createFileRoute } from '@tanstack/solid-router'
import { notificationsService } from '~/integrations/notificationService'
import { getCurrentUser } from '~/serverFn/auth'
import { redis } from '~/utils/redis'


export const Route = createFileRoute('/api/notifications')({
    server: {
        handlers: {
            GET: async () => {
                const user = await getCurrentUser();
                if (!user) return new Response(null, { status: 401 });
                await notificationsService.setup(user.id)
                const encoder = new TextEncoder()
                let intervalId: NodeJS.Timeout
                const stream = new ReadableStream({
                    async start(controller) {
                        controller.enqueue(encoder.encode(":\n\n"))
                        intervalId = setInterval(() => {
                            controller.enqueue(encoder.encode(":\n\n"))
                        }, 30000)
                        for await (const msg of notificationsService.listenForNotifications(user.id)) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg.message)}\n\n`))
                            await redis.xAck(`notifications:user:${user.id}`, `group:user:${user.id}`, msg.id)
                        }
                    },
                    async cancel() {
                        clearInterval(intervalId);
                        notificationsService.close()
                    }
                })

                return new Response(stream, {
                    headers: {
                        "Content-Type": "text/event-stream; charset=utf-8",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                    },
                })
            }
        }
    }
})