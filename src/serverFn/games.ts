import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start"
import z from "zod";
import { cacheService } from "~/integrations/cacheService";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as gamesRepository from "~/repositories/gamesRepository";
import { AppError } from "~/utils/AppError";

export const getGamesFn = createServerFn()
    .middleware([staticDataMiddleware])
    .inputValidator(z.object({
        developerId: z.number(),
        publisherId: z.number(),
        actorId: z.number(),
        platformId: z.number(),
        genre: z.string(),
        limit: z.number(),
        cursor: z.number()
    }).partial().optional())
    
    .handler(async ({ data }) => {
        const key = `games:${JSON.stringify(data)}`
        const cached = await cacheService.get<ReturnType<typeof gamesRepository.findGamesWithDetails>>(key)
        if (cached) return cached
        const games = await gamesRepository.findGamesWithDetails(data)
        cacheService.set(key, games, 3600)
        return games
    })

export const getGameFn = createServerFn()
    .middleware([staticDataMiddleware])
    .inputValidator((gameId: number) => {
        if (Number.isNaN(gameId) || gameId < 1) throw notFound()
        return gameId
    })
    .handler(async ({ data }) => {
        const key = `game:${data}`
        const cached = await cacheService.get<ReturnType<typeof gamesRepository.findById>>(key)
        if (cached) return cached
        const game = await gamesRepository.findById(data)
        if (!game) throw notFound()
        cacheService.set(key, game)
        return game
    })

const GameCreateSchema = z.object({
    title: z.string(),
    developerId: z.number(),
    publisherId: z.number(),
    banner: z.string(),
    cover: z.string(),
    summary: z.string().optional(),
    releaseDate: z.iso.date(),
    trailer: z.string().nullish(),
    media: z.array(z.object({
        key: z.string(),
        contentType: z.string()
    })),
    platforms: z.number().array(),
    genres: z.string().array()
})

const GameEditSchema = GameCreateSchema.partial().extend({ gameId: z.number() })

export const createGameFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .inputValidator(GameCreateSchema)
    .handler(async ({ data }) => {
        const { media, platforms, genres, ...game } = data
        try {
            void cacheService.delete("games")
            return await gamesRepository.createGame(game, { platforms, media, genres })
        } catch (error) {
            console.log(error)
            throw new AppError("Something went wrong", 500)
        }
    })

export const updateGameFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .inputValidator(GameEditSchema)
    .handler(async ({ data }) => {
        const { gameId, media, platforms, genres, ...game } = data
        void cacheService.delete("games", `game:${gameId}`)
        await gamesRepository.updateGame(gameId, game, { platforms, media, genres })
    })

export const getGamesWithoutExtras = createServerFn()
    .middleware([staticDataMiddleware])
    .handler(async () => gamesRepository.findAll())