
export async function uploadToSignedUrl(url: string, file: File, obj?: { signal?: AbortSignal, metadata?: Record<string, string> }) {
    const metadata: Record<string, string> = {}
    for (const key in obj?.metadata) {
        metadata[`X-Amz-Meta-${key}`] = obj.metadata[key]
    }
    const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
            ...metadata
        },
        signal: obj?.signal
    });
}
