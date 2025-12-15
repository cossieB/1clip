import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import * as gamesRepository from "~/repositories/gamesRepository";

export const getGamesFn = createServerFn().handler(() => gamesRepository.findAll())

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

export const getGamesByDeveloperFn = createServerFn()
    .inputValidator((id: number) => id)
    .handler(async ({ data }) => {
        if (data < 1) return []
        return gamesRepository.findByDeveloper(data)
    })

export const getGamesByPublisherFn = createServerFn()
    .inputValidator((id: number) => id)
    .handler(async ({ data }) => {
        if (data < 1) return [];
        return gamesRepository.findByPublisher(data)
    })