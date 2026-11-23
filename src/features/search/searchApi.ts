// server/search.ts
import { ensureVerified } from "~/features/auth/authApi";
import { searchGames, searchSquads, searchPosts } from "./searchRepository";

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;
const SEARCH_TYPES = ["games", "posts", "squads"] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

// every call is untrusted input, so check types here rather than trusting the TypeScript signature
function normalize(query: unknown): string {
    if (typeof query !== "string") throw new Error("Invalid search.");
    return query.trim().slice(0, MAX_LENGTH);
}

/** A few of each kind, for the dropdown. */
export const searchSuggestionsFn = async (query: string) => {
    "use server"
    await ensureVerified()
    const q = normalize(query);
    if (q.length < MIN_LENGTH) return { games: [], posts: [], squads: [] };

    const [gameResults, postResults, squadResults] = await Promise.all([
        searchGames(q, { limit: 4 }),
        searchPosts(q, { limit: 4 }),
        searchSquads(q, { limit: 4 }),
    ]);

    return { games: gameResults, posts: postResults, squads: squadResults };
};

/** One kind at a time with pagination, for the /search results page. */
export const searchFn = async (args: { query: string; type: SearchType; offset?: number }) => {
    "use server"
    await ensureVerified()
    const q = normalize(args?.query);
    if (q.length < MIN_LENGTH) throw new Error(`Search must be at least ${MIN_LENGTH} characters.`);
    if (!SEARCH_TYPES.includes(args.type)) throw new Error("Invalid search type.");

    const offset = Number.isInteger(args.offset) && args.offset! > 0 ? Math.min(args.offset!, 10_000) : 0;
    const pagination = { limit: 20, offset };

    switch (args.type) {
        case "games":
            return { type: "games" as const, items: await searchGames(q, pagination) };
        case "posts":
            return { type: "posts" as const, items: await searchPosts(q, pagination) };
        case "squads":
            return { type: "squads" as const, items: await searchSquads(q, pagination) };
    }
};