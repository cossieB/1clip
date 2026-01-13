import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start"
import z from "zod";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import * as gamesRepository from "~/repositories/gamesRepository";
import { AppError } from "~/utils/AppError";

export const getGamesFn = createServerFn()
    .inputValidator(z.object({
        developerId: z.number(),
        publisherId: z.number(),
        actorId: z.number(),
        platformId: z.number(),
        genre: z.string(),
        limit: z.number(),
        cursor: z.number()
    }).partial().optional())
    .handler(({ data }) => gamesRepository.findAll(data))

export const getGameFn = createServerFn()
    .inputValidator((gameId: number) => {
        if (Number.isNaN(gameId) || gameId < 1) throw notFound()
        return gameId
    })
    .handler(async ({ data }) => {
        const game = await gamesRepository.findById(data)
        if (!game) throw notFound()
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
        gamesRepository.updateGame(gameId, game, { platforms, media, genres })
    })