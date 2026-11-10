import 'server-only'
import { and, desc, eq, gt, InferInsertModel, lt, or, SQL, sql, asc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '~/drizzle/db';
import { games, lfg, lfgApplications, users } from '~/drizzle/schema';

export async function createSquad(row: InferInsertModel<typeof lfg>) {
    return db.insert(lfg).values(row).returning()
}

export async function updateLfg(lfgId: number, row: Partial<Omit<InferInsertModel<typeof lfg>, 'lfgId'>>, userId: string) {
    return db
        .update(lfg)
        .set({
            ...row,
            editedOn: sql`NOW()`
        })
        .where(and(
            eq(lfg.lfgId, lfgId),
            eq(lfg.userId, userId)
        ))
}

export type LfgApplicant = {
    id: string
    username: string
    image: string
}

export type LfgCursor = {
    createdAt: Date
    lfgId: number
}

export type LfgFilters = {
    gameId?: number
    userId?: string // creator
    limit?: number // default 20, max 100
    cursor?: LfgCursor // last item of the previous page
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function lfgSelection(currentUserId?: string) {
    const accepted = alias(lfgApplications, "accepted");
    const applicant = alias(users, "applicant");

    return {
        lfgId: lfg.lfgId,
        text: lfg.text,
        createdAt: lfg.createdAt,
        editedOn: lfg.editedOn,
        expiresAt: lfg.expiresAt,
        isActive: lfg.isActive,
        slots: lfg.slots, // excluding the creator
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
                select 1 from ${lfgApplications}
                where ${lfgApplications.lfgId} = ${lfg.lfgId}
                and ${lfgApplications.candidateId} = ${currentUserId}
            )`
            : sql<boolean>`false`
        ).as("has_applied"),
        acceptedApplicants: sql<LfgApplicant[]>`coalesce((
            select json_agg(
                json_build_object(
                    'id', ${applicant.id},
                    'username', ${applicant.username},
                    'image', ${applicant.image}
                ) order by ${accepted.appliedAt}, ${accepted.applicationId}
            )
            from ${lfgApplications} as accepted
            inner join ${users} as applicant on ${applicant.id} = ${accepted.candidateId}
            where ${accepted.lfgId} = ${lfg.lfgId}
            and ${accepted.status} = 'accepted'
        ), '[]'::json)`.as("accepted_applicants"),
    };
}

export async function findAll(args: LfgFilters = {}, currentUserId?: string) {
    const limit = Math.min(Math.max(args.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

    const conditions: (SQL | undefined)[] = [
        args.gameId !== undefined ? eq(lfg.gameId, args.gameId) : undefined,
        args.userId ? eq(lfg.userId, args.userId) : undefined,
        args.cursor
            ? or(
                lt(lfg.createdAt, args.cursor.createdAt),
                and(eq(lfg.createdAt, args.cursor.createdAt), lt(lfg.lfgId, args.cursor.lfgId))
            )
            : undefined,
    ];

    return db
        .select(lfgSelection(currentUserId))
        .from(lfg)
        .innerJoin(users, eq(users.id, lfg.userId))
        .leftJoin(games, eq(games.gameId, lfg.gameId))
        .where(and(...conditions))
        .orderBy(desc(lfg.createdAt), desc(lfg.lfgId))
        .limit(limit);
}

export type LfgWithDetails = Awaited<ReturnType<typeof findAll>>[number];

export async function findById(
    lfgId: number,
    currentUserId?: string
): Promise<LfgWithDetails | null> {
    const [post] = await db
        .select(lfgSelection(currentUserId))
        .from(lfg)
        .innerJoin(users, eq(users.id, lfg.userId))
        .leftJoin(games, eq(games.gameId, lfg.gameId))
        .where(eq(lfg.lfgId, lfgId))
        .limit(1);

    return post ?? null;
}

export type LfgApplicationPagination = {
    limit?: number // default 20, max 100
    cursor?: number // applicationId of the last item on the previous page
}

export async function findLfgApplications(
    lfgId: number,
    ownerId: string,
    { limit, cursor }: LfgApplicationPagination = {}
) {
    const pageSize = Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

    return db
        .select({
            applicationId: lfgApplications.applicationId,
            lfgId: lfgApplications.lfgId,
            message: lfgApplications.message,
            status: lfgApplications.status,
            appliedAt: lfgApplications.appliedAt,
            applicant: {
                id: users.id,
                username: users.username,
                image: users.image,
            },
        })
        .from(lfgApplications)
        .innerJoin(users, eq(users.id, lfgApplications.candidateId))
        .innerJoin(lfg, and(
            eq(lfgApplications.lfgId, lfg.lfgId),
            eq(lfg.userId, ownerId)
        ))
        .where(and(
            eq(lfgApplications.lfgId, lfgId),
            cursor !== undefined ? gt(lfgApplications.applicationId, cursor) : undefined
        ))
        .orderBy(asc(lfgApplications.applicationId))
        .limit(pageSize);
}