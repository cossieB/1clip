import { APIEvent } from "filesystem-routing/api";
import { getCurrentUser } from "~/features/auth/serverFn";
import { notificationsService } from "~/integrations/notificationService";

export async function GET(event: APIEvent) {
    const userSession = await getCurrentUser();
    if (!userSession) return new Response(null, { status: 401 });
    const encoder = new TextEncoder()
    let intervalId: NodeJS.Timeout
    const stream = new ReadableStream({
        async start(controller) {
            controller.enqueue(encoder.encode(":\n\n"))
            intervalId = setInterval(() => {
                controller.enqueue(encoder.encode(":\n\n"))
            }, 30000)
            notificationsService.subscribe(userSession.user.id, () => {
                controller.enqueue(encoder.encode("data: newNotification\n\n"))
            })
        },
        async cancel() {
            clearInterval(intervalId);
            notificationsService.unsubscribe(userSession.user.id)
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