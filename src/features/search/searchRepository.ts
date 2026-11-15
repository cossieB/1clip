// searchRepository.ts
import { and, asc, desc, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { games, posts, squads, users } from "~/drizzle/schema";


export type SearchPage = {
    limit?: number // default 20, max 50
    offset?: number
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function page({ limit, offset }: SearchPage) {
    return {
        limit: Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT),
        offset: Math.max(offset ?? 0, 0),
    };
}

/**
 * "hal inf" -> "hal:* & inf:*", so results appear while the user is still typing.
 * Only letters and digits survive, which keeps tsquery operators out of user input.
 */
function toPrefixQuery(input: string): string | null {
    const terms = input
        .toLowerCase()
        .match(/[\p{L}\p{N}]+/gu)
        ?.slice(0, 5)
        .map(term => `${term.slice(0, 30)}:*`);

    return terms?.length ? terms.join(" & ") : null;
}

export async function searchGames(query: string, pagination: SearchPage = {}) {
    const prefixQuery = toPrefixQuery(query);
    if (!prefixQuery) return [];

    const tsquery = sql`to_tsquery('english', ${prefixQuery})`;
    const { limit, offset } = page(pagination);

    return db
        .select({
            gameId: games.gameId,
            title: games.title,
            cover: games.cover,
            releaseDate: games.releaseDate,
        })
        .from(games)
        .where(sql`${games.searchVector} @@ ${tsquery}`)
        .orderBy(desc(sql`ts_rank(${games.searchVector}, ${tsquery})`), asc(games.gameId))
        .limit(limit)
        .offset(offset);
}

export async function searchPosts(query: string, pagination: SearchPage = {}) {
    const prefixQuery = toPrefixQuery(query);
    if (!prefixQuery) return [];

    const tsquery = sql`to_tsquery('english', ${prefixQuery})`;
    const { limit, offset } = page(pagination);

    return db
        .select({
            postId: posts.postId,
            title: posts.title,
            createdAt: posts.createdAt,
            author: {
                id: users.id,
                username: users.username,
                image: users.image,
            },
        })
        .from(posts)
        .innerJoin(users, eq(users.id, posts.userId))
        .where(and(
            eq(posts.pending, false),
            sql`${posts.searchVector} @@ ${tsquery}`
        ))
        .orderBy(desc(sql`ts_rank(${posts.searchVector}, ${tsquery})`), desc(posts.postId))
        .limit(limit)
        .offset(offset);
}

export async function searchSquads(query: string, pagination: SearchPage = {}) {
    // `lfg` has no search vector, so this is a substring match on the text or the game title.
    // Escape LIKE wildcards so a literal "%" or "_" in the query isn't treated as a pattern.
    const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
    const { limit, offset } = page(pagination);

    return db
        .select({
            squadId: squads.squadId,
            text: squads.text,
            createdAt: squads.createdAt,
            creator: {
                id: users.id,
                username: users.username,
                image: users.image,
            },
            game: {
                id: games.gameId,
                title: games.title,
            },
        })
        .from(squads)
        .innerJoin(users, eq(users.id, squads.userId))
        .leftJoin(games, eq(games.gameId, squads.gameId))
        .where(and(
            eq(squads.isActive, true),
            or(isNull(squads.expiresAt), gt(squads.expiresAt, sql`now()`)),
            or(ilike(squads.text, pattern), ilike(games.title, pattern))
        ))
        .orderBy(desc(squads.createdAt), desc(squads.squadId))
        .limit(limit)
        .offset(offset);
}