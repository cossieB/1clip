import { GET } from "@solidjs/web/server-functions";
import * as gamesRepository from "./gamesRepository";
import { redirect, respond } from "@solidjs/web";
import z from "zod";
import { GameCreateSchema, GameEditSchema, GetGamesSchema } from "./utils/zod";
import { zodSafeParse } from "~/utils/zodSafeParse";
import { ensureAdmin } from "../auth/utils/ensureAuth";
import { orphanedFileService } from "~/services/orphanedFileService";
import { storageService } from "~/integrations/storageService/index.server";
import { cacheAside } from "~/utils/cacheAside";
import { db } from "~/drizzle/db";
import { paths } from "~/router";

export const getGamesFn = GET(async (filters: z.input<typeof GetGamesSchema>) => {
    'use server'
    const data = zodSafeParse(GetGamesSchema, filters)
    try {
        const games = await gamesRepository.findAll(data)
        return respond(games, {
            headers: {
                "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
            }
        })
    } catch (error) {
        console.error(error)
        throw error
    }
})

export const getGameFn = GET(async (gameId: number) => {
    'use server'
    const data = zodSafeParse(z.int().positive(), gameId);
    const game = await gamesRepository.findById(data);
    return respond(game ?? null, {
        headers: {
            "Cache-Control": game ? "public, max-age=604800, stale-while-revalidate=86400" : "public, max-age=300",
            ...(game && {
                "Last-Modified": (game.dateModified ?? game.dateAdded).toUTCString()
            })
        }
    });
})

export async function createGameFn(g: z.input<typeof GameCreateSchema>) {
    'use server'
    const data = zodSafeParse(GameCreateSchema, g)
    await ensureAdmin()
    const { platforms, genres, characters, ...game } = data;
    const result = await gamesRepository.createGame(game, { platforms, media: [], genres, characters })
    return redirect(paths.admin.games(result)())
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

export const getAllGenresFn = GET(async () => {
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

export const getGamesAdminFn = GET(async (filters: z.input<typeof GetGamesSchema>) => {
    'use server'
    const games = await getGamesFn(filters)
    return respond(games, {
        headers: {
            "Cache-Control": "no-store"
        }
    })
})
