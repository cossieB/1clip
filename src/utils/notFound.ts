export function notFound(message?: string) {
    return new Response(message ?? "Not Found", {
        status: 404
    })
}