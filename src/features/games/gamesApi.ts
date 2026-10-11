import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start"
import z from "zod";
import { adminOnlyMiddleware } from "~/middleware/authorization";
import { staticDataMiddleware } from "~/middleware/static";
import * as gamesRepository from "./gamesRepository";
import { cacheAside } from "~/utils/cacheAside.server";
import { GameCreateSchema, GameEditSchema, GetGamesSchema } from "./utils/zod";
import { orphanedFileService } from "~/services/orphanedFileService";
import { storageService } from "~/integrations/storageService/index.server";
import { db } from "~/drizzle/db";

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
        try {
            const game = await gamesRepository.findById(data)
            if (!game) throw notFound();
            return game
            
        } catch (error) {
            console.error(error)
            throw error
        }
    })

export const createGameFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(GameCreateSchema)
    .handler(async ({ data }) => {
        const { platforms, genres, characters, ...game } = data;
        return await gamesRepository.createGame(game, { platforms, media: [], genres, characters })
    })

export const updateGameFn = createServerFn({ method: "POST" })
    .middleware([adminOnlyMiddleware])
    .validator(GameEditSchema)
    .handler(async ({ data }) => {
        const { gameId, media, platforms, genres, characters, ...game } = data;
        try {
            const [old] = await gamesRepository.updateGame(gameId, game, { platforms, media, genres, characters })
            if (data.cover) {
                orphanedFileService.removePendingUpload(data.cover);
                (data.cover != old.oldCover) && storageService.moveToDeletedBucket(old.oldCover)
            }
            if (data.banner) {
                orphanedFileService.removePendingUpload(data.banner);
                (data.banner != old.oldBanner) && storageService.moveToDeletedBucket(old.oldBanner)
            }
        } catch (error) {
            console.error(error)
            throw error
        }

    })

export const getGamesWithoutExtras = createServerFn()
    .middleware([staticDataMiddleware])
    .validator(z.string().optional())
    .handler(async ({data}) => {
        return gamesRepository.findAll(data)
    })

export const searchGamesFn = createServerFn()
    .validator(z.string().nonempty())
    .handler(async ({ data }) => {
        return gamesRepository.searchGames(data)
    })

export const getSimilarGames = createServerFn()
    .validator(z.number().positive())
    .middleware([staticDataMiddleware])
    .handler(async ({ data }) => {
        return await cacheAside(`similar:${data}`, () => gamesRepository.similarGames(data), 604800);
    })

export const getAllGenres = createServerFn()
    .handler(async () => {
        const res = await db.query.genres.findMany({
            orderBy: {
                name: "asc"
            }
        });
        return res
    })