
export async function uploadToSignedUrl(url: string, file: File, obj?: { signal?: AbortSignal, metadata?: Record<string, string> }) {

    try {
        const res = await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
            signal: obj?.signal
        });

        if (!res.ok) {
            console.error(res.status, await res.text());
        }
    } 
    catch (error) {
        console.error(error)
        throw error
    }
}
