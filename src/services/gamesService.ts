"use server"

import { createServerFunction } from "~/utils/createServerFunction";
import { GameCreateSchema, GameEditSchema, GetGamesSchema } from "~/zod/games";
import * as gamesRepository from "~/repositories/gamesRepository";
import z from "zod";
import { notFound } from "~/utils/notFound";
import { cacheAside } from "~/utils/cacheAside";

export const getGamesFn = createServerFunction()
    .setValidator(GetGamesSchema)
    .handler(async data => {
        const games = await gamesRepository.findGamesWithDetails(data);
        return games        
    })

export const getGameFn = createServerFunction()
    .setValidator(z.number())
    .handler(async gameId => {
        const game = await gamesRepository.findById(gameId)
        if (!game) throw notFound( "These aren't the games you're looking for")
        return game        
    })    

export const createGameFn = createServerFunction()
    .setValidator(GameCreateSchema)
    .handler(async data => {
        const { media, platforms, genres, ...game } = data
        return await gamesRepository.createGame(game, { platforms, media, genres })        
    })

export const updateGameFn = createServerFunction()
    .setValidator(GameEditSchema)
    .handler(async data => {
        const { gameId, media, platforms, genres, ...game } = data
        await gamesRepository.updateGame(gameId, game, { platforms, media, genres })        
    })    

export const getGamesWithoutExtras = createServerFunction()
    .handler(() => gamesRepository.findAll())    

export const searchGamesFn = createServerFunction()
    .setValidator(z.string())
    .handler(async searchStr => await gamesRepository.searchGames(searchStr))

export const getSimilarGames = createServerFunction()
    .setValidator(z.number().positive())
    .handler(gameId => {
        return cacheAside(`similar:${gameId}`, () => gamesRepository.similarGames(gameId), 604800)
    })