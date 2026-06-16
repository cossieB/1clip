export function notFound(message?: string) {
    return new Response(message, {
        status: 404
    })
}