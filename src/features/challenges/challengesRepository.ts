import { and, asc, eq, sql } from "drizzle-orm";
import { db, Tx } from "~/drizzle/db";
import { challenges, users, userChallenges } from "~/drizzle/schema";
import { ChallengeTitle } from "./challengeBookkeepingScript";
import "server-only";

export const CHALLENGE = {
    createPost: "Make A Post",
    comment: "Join The Conversation",
    likePost: "Show Appreciation",
    likeComment: "Appreciate A Comment",
    receiveLike: "Get Noticed",
    squad: "Squad Up",
} satisfies Record<string, ChallengeTitle>;

/**
 * Awards a challenge to a user. Returns the XP granted (0 if the challenge
 * is missing/inactive or was already awarded today).
 * Pass a transaction so the award commits or rolls back with the action itself.
 */
export async function awardXp(
    client: typeof db | Tx,
    userId: string,
    title: (typeof CHALLENGE)[keyof typeof CHALLENGE],
) {
    const [challenge] = await client
        .select({ id: challenges.challengeId, xp: challenges.xpReward })
        .from(challenges)
        .where(and(eq(challenges.title, title), eq(challenges.isActive, true)));

    if (!challenge) return 0;

    const inserted = await client
        .insert(userChallenges)
        .values({ userId, challengeId: challenge.id })
        .onConflictDoNothing()
        .returning({ challengeId: userChallenges.challengeId });

    // Conflict means already awarded today: don't touch the total
    if (inserted.length === 0) return 0;

    await client
        .update(users)
        .set({ xp: sql`${users.xp} + ${challenge.xp}` })
        .where(eq(users.id, userId));

    return challenge.xp;
}

export async function getTodaysChallengeProgress(userId: string) {
    const rows = await db
        .select({
            challengeId: challenges.challengeId,
            title: challenges.title,
            description: challenges.description,
            xpReward: challenges.xpReward,
            completedAt: userChallenges.createdAt,
        })
        .from(challenges)
        .leftJoin(
            userChallenges,
            and(
                eq(userChallenges.challengeId, challenges.challengeId),
                eq(userChallenges.userId, userId),
                eq(userChallenges.awardedOn, sql`(now() at time zone 'utc')::date`),
            ),
        )
        .where(eq(challenges.isActive, true))
        .orderBy(asc(challenges.challengeId));

    return rows.map(({ completedAt, ...challenge }) => ({
        ...challenge,
        completed: completedAt !== null,
        completedAt,
    }));
}