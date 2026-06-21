'use server'

import { GameCreateSchema, GameEditSchema, GetGamesSchema } from "~/zod/games";
import * as gamesRepository from "~/repositories/gamesRepository";
import z from "zod";
import { notFound } from "~/utils/notFound";
import { parseZod } from "~/utils/parseZod";
import { setResponseHeader } from "@solidjs/start/http";

export async function getGamesFn(filters: z.input<typeof GetGamesSchema>) {
    const data = parseZod(GetGamesSchema, filters)
    setResponseHeader("cache-control", "max-age=86400, public, immutable, stale-while-revalidate=604800")
    return await gamesRepository.findGamesWithDetails(data);
}

export async function getGameFn(gameId: number) {
    parseZod(z.number(), gameId)
    const game = await gamesRepository.findById(gameId)
    if (!game) throw notFound("These aren't the games you're looking for")
    setResponseHeader("cache-control", "max-age=86400, public, immutable, stale-while-revalidate=604800")
    return game
}

export async function createGameFn(g: z.input<typeof GameCreateSchema>) {
    const data = parseZod(GameCreateSchema, g)
    const { media, platforms, genres, ...game } = data
    return await gamesRepository.createGame(game, { platforms, media, genres })

}

export async function updateGameFn(g: z.input<typeof GameEditSchema>) {
    const data = parseZod(GameEditSchema, g)
    const { gameId, media, platforms, genres, ...game } = data
    await gamesRepository.updateGame(gameId, game, { platforms, media, genres })
}

export async function getGamesWithoutExtras() {
    setResponseHeader("cache-control", "max-age=86400, public, immutable, stale-while-revalidate=604800")
    return gamesRepository.findAll()
}

export async function searchGamesFn(str: string) {
    return await gamesRepository.searchGames(z.coerce.string().parse(str))
}

export async function getSimilarGames(gameId: number) {
    parseZod(z.number(), gameId)
    return await gamesRepository.similarGames(gameId)
}    