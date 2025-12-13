import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import * as gamesRepository from "~/repositories/gamesRepository";

export const getGamesFn = createServerFn().handler(() => gamesRepository.findAll())

export const getGameFn = createServerFn()
    .inputValidator(param => {
        const gameId = Number(param)
        if (Number.isNaN(gameId) || gameId < 1) throw notFound()
        return gameId
    })
    .handler(async ({ data }) => {
        const game = await gamesRepository.findById(data)
        if (!game) throw notFound()
        return game
    })