export type GameQueryFilters = {
    developerId?: number
    publisherId?: number
    actorId?: number
    platformId?: number
    genre?: string
    limit?: number
    cursor?: number
}

export type GameInsert = {
    platforms: number[]
    genres: string[]
    media: { key: string, contentType: string, metadata?: Record<string, string> }[]
}