import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start"
import z from "zod";
import * as gamesRepository from "~/repositories/gamesRepository";

export const getGamesFn = createServerFn()
    .inputValidator(z.object({
        developerId: z.number(),
        publisherId: z.number(),
        actorId: z.number(),
        platformId: z.number(),
        tag: z.string(),
        limit: z.number(),
        cursor: z.number()
    }).partial().optional())
    .handler(({data}) => gamesRepository.findAll(data))

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