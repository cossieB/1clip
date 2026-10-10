import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start"
import z from "zod";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as gamesRepository from "./gamesRepository";
import { cacheAside } from "~/utils/cacheAside.server";
import { GameCreateSchema, GameEditSchema, GetGamesSchema } from "./utils/zod";
import { orphanedFileService } from "~/services/orphanedFileService";
import { AppError } from "~/utils/AppError.server";
import { storageService } from "~/integrations/storageService/index.server";
import { sleep } from "~/lib/sleep";

export const getGamesFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator(GetGamesSchema)

    .handler(async ({ data }) => {
        const games = await gamesRepository.findGamesWithDetails(data);
        return games
    })

export const getGameFn = createServerFn()
    .middleware([staticDataMiddleware])
    .validator((gameId: number) => {
        if (Number.isNaN(gameId) || gameId < 1) throw notFound()
        return gameId
    })
    .handler(async ({ data }) => {
        const game = await gamesRepository.findById(data)
        if (!game) throw notFound();
        return game
    })

export const createGameFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(GameCreateSchema)
    .handler(async ({ data }) => {
        const { platforms, genres, ...game } = data;
        return await gamesRepository.createGame(game, { platforms, media: [], genres })
    })

export const updateGameFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(GameEditSchema)
    .handler(async ({ data }) => {
        const { gameId, media, platforms, genres, ...game } = data
        const [old] = await gamesRepository.updateGame(gameId, game, { platforms, media, genres })
        if (data.cover) {
            orphanedFileService.removePendingUpload(data.cover);
            (data.cover != old.oldCover) && storageService.moveToDeletedBucket(old.oldCover)
        }
        if (data.banner) {
            orphanedFileService.removePendingUpload(data.banner);
            (data.banner != old.oldBanner) && storageService.moveToDeletedBucket(old.oldBanner)
        }

    })

export const getGamesWithoutExtras = createServerFn()
    .middleware([staticDataMiddleware])
    .validator(z.string().optional())
    .handler(async ({data}) => {
        console.log("HERE")
        return gamesRepository.findAll(data)
    })

export const searchGamesFn = createServerFn()
    .validator(z.string())
    .handler(async ({ data }) => {
        return gamesRepository.searchGames(data)
    })

export const getSimilarGames = createServerFn()
    .validator(z.number().positive())
    .middleware([staticDataMiddleware])
    .handler(async ({ data }) => {
        return await cacheAside(`similar:${data}`, () => gamesRepository.similarGames(data), 604800);
    })

