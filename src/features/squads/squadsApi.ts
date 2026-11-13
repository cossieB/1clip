import { GET } from "@solidjs/web/server-functions";
import z from "zod";
import { ApplyToSquadSchema, GetApplicationsSchema, GetSquadsSchema, SquadCreateSchema, UpdateApplicationSchema, UpdateSquadSchema } from "./utils/zod";
import * as squadsRepository from "./squadsRepository"
import { zodSafeParse } from "~/utils/zodSafeParse";
import { getCurrentUser } from "../auth/serverFn";
import { respond } from "@solidjs/web";
import { ensureVerified } from "../auth/utils/ensureAuth";
import { DrizzleQueryError } from "drizzle-orm";
import { rateLimiter } from "~/utils/rateLimiter.server";
import { addNotification } from "../notifications/addNotification";

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
    const [result] = await squadsRepository.createSquad({ ...data, userId: userSession.user.id })
    return result
}

export async function updateSquadFn(input: z.input<typeof UpdateSquadSchema>) {
    'use server'
    const data = zodSafeParse(UpdateSquadSchema, input)
    const userSession = await ensureVerified();
    await rateLimiter("squad:update", userSession.user.id, 10, 60)
    const { lfgId, ...rest } = data
    await squadsRepository.updateSquad(lfgId, rest, userSession.user.id)
}

export const getSquadApplicationsFn = GET(async (arg: z.input<typeof GetApplicationsSchema>) => {
    'use server'
    const data = zodSafeParse(GetApplicationsSchema, arg)
    const userSession = await ensureVerified()
    const applications = await squadsRepository.findSquadApplications(data.squadId, userSession.user.id, { cursor: data.cursor })
    return respond(applications, {
        headers: {
            "Cache-Control": "private, max-age=60"
        }
    })
})

export async function applyToSquadFn(input: z.input<typeof ApplyToSquadSchema>) {
    'use server'
    const data = zodSafeParse(ApplyToSquadSchema, input)
    const userSession = await ensureVerified()
    await rateLimiter("squad:apply", userSession.user.id, 10, 60)
    try {
        const application = await squadsRepository.createSquadApplication({
            candidateId: userSession.user.id,
            squadId: data.id,
            message: data.message
        })
        void addNotification([{userId: application.squadCreatorId}], {
            actionUrl: `/squads/${application.squadId}`,
            message: `${userSession.user.displayUsername} wants to join your crew`,
            entityId: application.squadId,
            entityType: "squads",
            sourceUserId: userSession.user.id,
            title: "Your squad is growing",
            type: "SQUAD"
        })
    }
    catch (error) {
        if (error instanceof DrizzleQueryError) {
            const cause = error.cause

            if (cause instanceof Error && cause.message.includes("violates unique constraint")) {
                throw respond(new Error("You have already applied to this squad"), { status: 400 })
            }
        }

        throw error
    }
}

export async function updateSquadApplicationFn(input: z.input<typeof UpdateApplicationSchema>) {
    'use server'
    const data = zodSafeParse(UpdateApplicationSchema, input)
    const userSession = await ensureVerified()
    const updated = await squadsRepository.updateSquadApplication(data.applicationId, data.status, userSession.user.id)
    if (updated.status == "accepted") void addNotification([{userId: updated.candidateId}], {
            actionUrl: `/squads/${updated.squadId}`,
            message: `${userSession.user.displayUsername} has accepted your application`,
            entityId: updated.squadId,
            entityType: "squads",
            sourceUserId: userSession.user.id,
            title: "Chosen One",
            type: "SQUAD"        
    }) 
}

export async function deleteSquadApplicationFn(id: number) {
    'use server'
    const data = zodSafeParse(z.int(), id)
    const userSession = await ensureVerified()
    await squadsRepository.deleteSquadApplication(data, userSession.user.id)
}