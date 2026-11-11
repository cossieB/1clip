import 'server-only'
import { and, desc, eq, gt, InferInsertModel, lt, or, SQL, sql, asc, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '~/drizzle/db';
import { games, squads, squadApplications, users } from '~/drizzle/schema';
import { SquadApplicationStatus } from '~/drizzle/models';

export async function createSquad(row: InferInsertModel<typeof squads>) {
    return db.insert(squads).values(row).returning()
}

export async function updateSquad(lfgId: number, row: Partial<Omit<InferInsertModel<typeof squads>, 'lfgId'>>, userId: string) {
    return db
        .update(squads)
        .set({
            ...row,
            editedOn: sql`NOW()`
        })
        .where(and(
            eq(squads.squadId, lfgId),
            eq(squads.userId, userId)
        ))
}

export type SquadApplicant = {
    id: string
    username: string
    image: string
}

export type SquadFilters = {
    gameId?: number
    userId?: string
    limit?: number
    cursor?: number
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function squadSelection(currentUserId?: string) {
    const accepted = alias(squadApplications, "accepted");
    const applicant = alias(users, "applicant");

    return {
        squadId: squads.squadId,
        text: squads.text,
        createdAt: squads.createdAt,
        editedOn: squads.editedOn,
        expiresAt: squads.expiresAt,
        isActive: squads.isActive,
        slots: squads.slots,
        creator: {
            id: users.id,
            username: users.username,
            image: users.image,
        },
        game: {
            id: games.gameId,
            title: games.title,
        },
        hasApplied: (currentUserId
            ? sql<boolean>`exists (
                select 1 from ${squadApplications}
                where ${squadApplications.squadId} = ${squads.squadId}
                and ${squadApplications.candidateId} = ${currentUserId}
            )`
            : sql<boolean>`false`
        ).as("has_applied"),
        acceptedApplicants: sql<SquadApplicant[]>`coalesce((
            select json_agg(
                json_build_object(
                    'id', ${applicant.id},
                    'username', ${applicant.username},
                    'image', ${applicant.image}
                ) order by ${accepted.appliedAt}, ${accepted.applicationId}
            )
            from ${squadApplications} as accepted
            inner join ${users} as applicant on ${applicant.id} = ${accepted.candidateId}
            where ${accepted.squadId} = ${squads.squadId}
            and ${accepted.status} = 'accepted'
        ), '[]'::json)`.as("accepted_applicants"),
    };
}

export async function findAll(args: SquadFilters = {}, currentUserId?: string) {
    const limit = Math.min(Math.max(args.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

    const conditions: (SQL | undefined)[] = [
        args.gameId !== undefined ? eq(squads.gameId, args.gameId) : undefined,
        args.userId ? eq(squads.userId, args.userId) : undefined,
        args.cursor !== undefined ? lt(squads.squadId, args.cursor) : undefined,
    ];

    return db
        .select(squadSelection(currentUserId))
        .from(squads)
        .innerJoin(users, eq(users.id, squads.userId))
        .leftJoin(games, eq(games.gameId, squads.gameId))
        .where(and(...conditions))
        .orderBy(desc(squads.squadId))
        .limit(limit);
}

export type SquadWithDetails = Awaited<ReturnType<typeof findAll>>[number];

export async function findById(
    lfgId: number,
    currentUserId?: string
): Promise<SquadWithDetails | null> {
    const [post] = await db
        .select(squadSelection(currentUserId))
        .from(squads)
        .innerJoin(users, eq(users.id, squads.userId))
        .leftJoin(games, eq(games.gameId, squads.gameId))
        .where(eq(squads.squadId, lfgId))
        .limit(1);

    return post ?? null;
}

export type LfgApplicationPagination = {
    limit?: number
    cursor?: number
}

export async function findSquadApplications(
    lfgId: number,
    ownerId: string,
    { limit, cursor }: LfgApplicationPagination = {}
) {
    const pageSize = Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

    return db
        .select({
            applicationId: squadApplications.applicationId,
            lfgId: squadApplications.squadId,
            message: squadApplications.message,
            status: squadApplications.status,
            appliedAt: squadApplications.appliedAt,
            applicant: {
                id: users.id,
                username: users.username,
                image: users.image,
            },
        })
        .from(squadApplications)
        .innerJoin(users, eq(users.id, squadApplications.candidateId))
        .innerJoin(squads, and(
            eq(squadApplications.squadId, squads.squadId),
            eq(squads.userId, ownerId)
        ))
        .where(and(
            eq(squadApplications.squadId, lfgId),
            cursor !== undefined ? gt(squadApplications.applicationId, cursor) : undefined
        ))
        .orderBy(asc(squadApplications.applicationId))
        .limit(pageSize);
}

export type SquadApplicationWithApplicant = Awaited<ReturnType<typeof findSquadApplications>>[number];

export async function createSquadApplication(input: InferInsertModel<typeof squadApplications>) {
    const [inserted] = await db.insert(squadApplications).values(input).returning();
    return inserted
}

export async function updateSquadApplication(applicationId: number, status: SquadApplicationStatus, ownerId: string) {
    return db
        .update(squadApplications)
        .set({ status })
        .where(and(
            eq(squadApplications.applicationId, applicationId),
            inArray(
                squadApplications.squadId,
                db
                    .select({ squadId: squads.squadId })
                    .from(squads)
                    .where(eq(squads.userId, ownerId))
            )
        ))
}

export async function deleteSquadApplication(applicationId: number, userId: string) {
    return db.delete(squadApplications)
        .where(and(
            eq(squadApplications.applicationId, applicationId),
            eq(squadApplications.candidateId, userId)
        ))
}