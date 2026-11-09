import { GET } from "@solidjs/web/server-functions";
import * as gamesRepository from "./gamesRepository";
import { respond } from "@solidjs/web";

export const simpleSearchGamesFn = GET(async (title: string) => {
    'use server'
    const games = await gamesRepository.findAll(String(title))
    return respond(games, {
        headers: {
            "Cache-Control": "public, max-age=86400"
        }
    })
})