import z from "zod"
import { GameCreateSchema, GetGamesSchema } from "../utils/zod"

export type GameQueryFilters = z.input<typeof GetGamesSchema>

export type GameInsert = {
    platforms: number[]
    genres: string[]
    media: { key: string, contentType: string, metadata?: Record<string, string> }[],
    characters: z.infer<typeof GameCreateSchema>['characters']
}