export function GET() {
    return new Response("OK", {
        headers: {
            "Cache-Control": "no-store"
        }
    })
}