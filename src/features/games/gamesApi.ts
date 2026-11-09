import { GET } from "@solidjs/web/server-functions";
import * as gamesRepository from "./gamesRepository";
import { respond } from "@solidjs/web";
import z from "zod";
import { GameCreateSchema, GameEditSchema, GetGamesSchema } from "./utils/zod";
import { zodSafeParse } from "~/utils/zodSafeParse";
import { ensureAdmin } from "../auth/utils/ensureAuth";
import { orphanedFileService } from "~/services/orphanedFileService";
import { storageService } from "~/integrations/storageService/index.server";
import { cacheAside } from "~/utils/cacheAside";
import { db } from "~/drizzle/db";

export const getGamesFn = GET(async (filters: z.input<typeof GetGamesSchema>) => {
    'use server'
    const data = zodSafeParse(GetGamesSchema, filters)
    const games = await gamesRepository.findAll(data)
    return respond(games, {
        headers: {
            // "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})

export const getGameFn = GET(async (gameId: number) => {
    'use server'
    const data = zodSafeParse(z.number().positive(), gameId)
    const game = await gamesRepository.findById(data);
    return respond(game ?? null, {
        headers: {
            // "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})

export async function createGameFn(g: z.input<typeof GameCreateSchema>) {
    'use server'
    const data = zodSafeParse(GameCreateSchema, g)
    await ensureAdmin()
    const { platforms, genres, characters, ...game } = data;
    return await gamesRepository.createGame(game, { platforms, media: [], genres, characters })
}

export async function updateGameFn(g: z.input<typeof GameEditSchema>) {
    'use server'
    const data = zodSafeParse(GameEditSchema, g)
    await ensureAdmin()
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
    }
    catch (error) {
        console.error(error)
        throw error
    }
}

export const getSimilarGames = GET(async (gameId: number) => {
    'use server'
    const data = zodSafeParse(z.int(), gameId);
    const result = await cacheAside(`similar:${data}`, () => gamesRepository.similarGames(data), 604800);
    return respond(result, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})

export const getAllGenres = GET(async () => {
    'use server'
    const res = await db.query.genres.findMany({
        orderBy: {
            name: "asc"
        }
    });
    return respond(res, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }
    })
})