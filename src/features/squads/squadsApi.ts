import { GET } from "@solidjs/web/server-functions";
import z from "zod";
import { ApplyToSquadSchema, GetApplicationsSchema, GetSquadsSchema, SquadCreateSchema, UpdateApplicationSchema, UpdateSquadSchema } from "./utils/zod";
import * as squadsRepository from "./squadsRepository"
import { zodSafeParse } from "~/utils/zodSafeParse";
import { getCurrentUser } from "../auth/serverFn";
import { respond } from "@solidjs/web";
import { ensureVerified } from "../auth/authApi";
import { DrizzleQueryError } from "drizzle-orm";
import { rateLimiter } from "~/utils/rateLimiter.server";
import { addNotification } from "../notifications/addNotification";
import { db } from "~/drizzle/db";
import { awardXp, CHALLENGE } from "../challenges/challengesRepository";

export const getSquadsFn = GET(async (filter: z.input<typeof GetSquadsSchema>) => {
    'use server'
    const data = zodSafeParse(GetSquadsSchema, filter)
    const userSession = await getCurrentUser()
    const squads = await squadsRepository.findAll(data, userSession?.user.id)
    return respond(squads, {
        headers: {
            // "Cache-Control": "private, max-age=60"
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
            // "Cache-Control": "private, max-age=60"
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
    const { squadId, ...rest } = data
    await squadsRepository.updateSquad(squadId, rest, userSession.user.id)
}

export async function deleteSquadFn(postId: number) {
    'use server'
    const data = zodSafeParse(z.int().positive(), postId)
    const userSession = await ensureVerified()
    await rateLimiter("post:delete", userSession.user.id, 5, 60)
    const result = await squadsRepository.deleteSquad(data, userSession.user.id);
    if (result.length == 0) throw respond(new Error("Failed to delete"), {
        status: 500
    })
}

export const getSquadApplicationsFn = GET(async (arg: z.input<typeof GetApplicationsSchema>) => {
    'use server'
    const data = zodSafeParse(GetApplicationsSchema, arg)
    const userSession = await ensureVerified()
    const applications = await squadsRepository.findSquadApplications(data.squadId, userSession.user.id, { cursor: data.cursor })
    return respond(applications, {
        headers: {
            // "Cache-Control": "private, max-age=60"
        }
    })
})

export async function applyToSquadFn(input: z.input<typeof ApplyToSquadSchema>) {
    'use server'
    const data = zodSafeParse(ApplyToSquadSchema, input)
    const userSession = await ensureVerified()
    await rateLimiter("squad:apply", userSession.user.id, 10, 60)
    try {
        await db.transaction(async tx => {
            const application = await squadsRepository.createSquadApplication(tx, {
                candidateId: userSession.user.id,
                squadId: data.id,
                message: data.message
            })
            await addNotification(tx, [{ userId: application.squadCreatorId }], {
                actionUrl: `/squads/${application.squadId}`,
                message: `${userSession.user.displayUsername} wants to join your crew`,
                entityId: application.squadId,
                entityType: "squads",
                sourceUserId: userSession.user.id,
                title: "Your squad is growing",
                type: "SQUAD"
            })
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
    await db.transaction(async tx => {
        const updated = await squadsRepository.updateSquadApplication(tx, data.applicationId, data.status, userSession.user.id)
        if (updated.status == "accepted") {
            await awardXp(tx, userSession.user.id, CHALLENGE.squad)
            await awardXp(tx, updated.candidateId, CHALLENGE.squad)
            await addNotification(tx, 
                [{ userId: updated.candidateId }], {
                actionUrl: `/squads/${updated.squadId}`,
                message: `${userSession.user.displayUsername} has accepted your application`,
                entityId: updated.squadId,
                entityType: "squads",
                sourceUserId: userSession.user.id,
                title: "Chosen One",
                type: "SQUAD"
            })

        }
    })
}

export async function deleteSquadApplicationFn(id: number) {
    'use server'
    const data = zodSafeParse(z.int(), id)
    const userSession = await ensureVerified()
    await squadsRepository.deleteSquadApplication(data, userSession.user.id)
}