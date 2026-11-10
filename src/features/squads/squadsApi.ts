import { GET } from "@solidjs/web/server-functions";
import z from "zod";
import { GetApplicationsSchema, GetSquadsSchema, SquadCreateSchema, UpdateSquadSchema } from "./utils/zod";
import * as squadsRepository from "./squadsRepository"
import { zodSafeParse } from "~/utils/zodSafeParse";
import { getCurrentUser } from "../auth/serverFn";
import { respond } from "@solidjs/web";
import { ensureVerified } from "../auth/utils/ensureAuth";

export const getSquadsFn = GET(async (filter: z.input<typeof GetSquadsSchema>) => {
    'use server'
    const data = zodSafeParse(GetSquadsSchema, filter)
    const userSession = await getCurrentUser()
    const squads = await squadsRepository.findAll(data, userSession?.user.id)
    return respond(squads, {
        headers: {
            "Cache-Control": "private, max-age=60"
        }
    })
})

export const getSquadFn = GET(async (id: number) => {
    'use server'
    const data = zodSafeParse(z.int().positive(), id)
    const userSession = await getCurrentUser()
    const squad = await squadsRepository.findById(data, userSession?.user.id)
    return respond(squad, {
        headers: {
            "Cache-Control": "private, max-age=60"
        }
    })  
})

export async function createSquadFn(input: z.input<typeof SquadCreateSchema>) {
    'use server'
    const data = zodSafeParse(SquadCreateSchema, input)
    const userSession = await ensureVerified()
    const [result] = await squadsRepository.createSquad({...data, userId: userSession.user.id})
    return result
}

export async function updateSquadFn(input: z.input<typeof UpdateSquadSchema>) {
    'use server'
    const data = zodSafeParse(UpdateSquadSchema, input)
    const userSession = await ensureVerified()
    const {lfgId, ...rest} = data
    await squadsRepository.updateLfg(lfgId, rest, userSession.user.id)
}

export const getSquadApplicationsFn = GET(async (arg: z.input<typeof GetApplicationsSchema>) => {
    'use server'
    const data = zodSafeParse(GetApplicationsSchema, arg)
    const userSession = await ensureVerified()
    const applications = await squadsRepository.findLfgApplications(data.squadId, userSession.user.id, {cursor: data.cursor} )
    return respond(applications, {
        headers: {
            "Cache-Control": "private, max-age=60"
        }        
    })
})