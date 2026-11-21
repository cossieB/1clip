import { sql, eq } from "drizzle-orm";
import { challenges } from "~/drizzle/schema";
import { db } from "~/drizzle/db";

export const DEFINITIONS = [
    { key: "createPost",     title: "Make A Post",              description: "Create a new post",                        xpReward: 2 },
    { key: "comment",        title: "Join The Conversation",          description: "Comment on another user's post",           xpReward: 1 },
    { key: "likePost",       title: "Show Appreciation",                description: "Like another user's post",                 xpReward: 1 },
    { key: "likeComment",    title: "Appreciate A Comment",             description: "Like another user's comment",              xpReward: 1 },
    { key: "receiveLike",    title: "Get Noticed",             description: "Receive a like on your post or comment",   xpReward: 5 },
    { key: "squad",          title: "Squad Up",       description: "Join a squad or accept someone into yours", xpReward: 5 },
] as const

type Key = (typeof DEFINITIONS)[number]["key"];
export type ChallengeTitle = (typeof DEFINITIONS)[number]['title']

async function main() {
    await db.transaction(async (tx) => {
        // 1. Upsert challenges (matched by title, so the script is re-runnable)
        const ids = {} as Record<Key, number>;

        for (const def of DEFINITIONS) {
            const [existing] = await tx
                .select({ id: challenges.challengeId })
                .from(challenges)
                .where(eq(challenges.title, def.title));

            if (existing) {
                await tx
                    .update(challenges)
                    .set({ description: def.description, xpReward: def.xpReward })
                    .where(eq(challenges.challengeId, existing.id));
                ids[def.key] = existing.id;
            } else {
                const [row] = await tx
                    .insert(challenges)
                    .values({ title: def.title, description: def.description, xpReward: def.xpReward })
                    .returning({ id: challenges.challengeId });
                ids[def.key] = row.id;
            }
        }

        // 2. Retroactively build awards from historical activity.
        //    One row per (user, challenge, UTC day), matching the table's PK.
        await tx.execute(sql`
            WITH events AS (
                -- Create a post
                SELECT p.user_id, ${ids.createPost}::int AS challenge_id,
                       (p.created_at AT TIME ZONE 'utc')::date AS day
                FROM posts p
                WHERE NOT p.pending

                UNION ALL
                -- Comment on another user's post
                SELECT c.user_id, ${ids.comment}::int,
                       (c.created_at AT TIME ZONE 'utc')::date
                FROM comments c
                JOIN posts p ON p.post_id = c.post_id
                WHERE c.user_id <> p.user_id

                UNION ALL
                -- Like another user's post
                SELECT pl.user_id, ${ids.likePost}::int,
                       (pl.date AT TIME ZONE 'utc')::date
                FROM post_likes pl
                JOIN posts p ON p.post_id = pl.post_id
                WHERE pl.user_id <> p.user_id

                UNION ALL
                -- Like another user's comment
                SELECT cl.user_id, ${ids.likeComment}::int,
                       (cl.date AT TIME ZONE 'utc')::date
                FROM comment_likes cl
                JOIN comments c ON c.comment_id = cl.comment_id
                WHERE cl.user_id <> c.user_id

                UNION ALL
                -- Receive a like on a post (author is rewarded)
                SELECT p.user_id, ${ids.receiveLike}::int,
                       (pl.date AT TIME ZONE 'utc')::date
                FROM post_likes pl
                JOIN posts p ON p.post_id = pl.post_id
                WHERE pl.user_id <> p.user_id

                UNION ALL
                -- Receive a like on a comment (author is rewarded)
                SELECT c.user_id, ${ids.receiveLike}::int,
                       (cl.date AT TIME ZONE 'utc')::date
                FROM comment_likes cl
                JOIN comments c ON c.comment_id = cl.comment_id
                WHERE cl.user_id <> c.user_id

                UNION ALL
                -- Joined a squad (accepted applicant)
                SELECT a.candidate_id, ${ids.squad}::int,
                       (a.applied_at AT TIME ZONE 'utc')::date
                FROM squad_applications a
                WHERE a.status = 'accepted'

                UNION ALL
                -- Accepted someone into your squad (squad owner)
                SELECT l.user_id, ${ids.squad}::int,
                       (a.applied_at AT TIME ZONE 'utc')::date
                FROM squad_applications a
                JOIN squads l ON l.squad_id = a.squad_id
                WHERE a.status = 'accepted'
                  AND a.candidate_id <> l.user_id
            )
            INSERT INTO user_challenges (user_id, challenge_id, awarded_on)
            SELECT DISTINCT user_id, challenge_id, day
            FROM events
            ON CONFLICT DO NOTHING
        `);

        // 3. Recompute every user's XP from their awards
        await tx.execute(sql`
            UPDATE users u
            SET xp = COALESCE((
                SELECT SUM(ch.xp_reward)
                FROM user_challenges uc
                JOIN challenges ch ON ch.challenge_id = uc.challenge_id
                WHERE uc.user_id = u.id
            ), 0)
        `);
    });

    console.log("Challenges seeded and XP awarded retroactively.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });