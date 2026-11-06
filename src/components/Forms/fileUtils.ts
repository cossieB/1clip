type FileLike = { name: string; type: string }

/**
 * Matches a file against an `accept` string like the native input does:
 * ".png", "image/*", "image/png", or a comma-separated mix.
 * During a drag only `type` is known (no name), so extension tokens pass then
 * and get checked properly on drop.
 */
export function matchesAccept(file: FileLike, accept?: string) {
    if (!accept) return true

    const tokens = accept
        .split(",")
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)

    const name = file.name.toLowerCase()
    const type = file.type.toLowerCase()

    return tokens.some(token => {
        if (token.startsWith(".")) return !name || name.endsWith(token)
        if (token.endsWith("/*")) return !type || type.startsWith(token.slice(0, -1))
        return !type || type === token
    })
}

export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    const units = ["KB", "MB", "GB"]
    let value = bytes / 1024
    let i = 0
    while (value >= 1024 && i < units.length - 1) {
        value /= 1024
        i++
    }
    return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`
}