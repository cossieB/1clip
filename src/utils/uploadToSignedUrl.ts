
export async function uploadToSignedUrl(url: string, file: File, obj?: { signal?: AbortSignal, metadata?: Record<string, string> }) {
    // const metadata: Record<string, string> = {}
    // if (obj?.metadata) {
    //     for (const [metaKey, metaValue] of Object.entries(obj.metadata)) {
    //         metadata[`x-amz-meta-${metaKey}`] = metaValue;
    //     }
    // }

    try {
        const res = await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
                // ...metadata
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
