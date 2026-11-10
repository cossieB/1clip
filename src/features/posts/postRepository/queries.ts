import { and, eq } from "drizzle-orm";
import { posts } from "~/drizzle/schema";
import { basePostsCte, buildFilterConditions } from "./query-builder";
import { selectPostDetails } from "./details-query";
import { PostFilters } from "../utils/zod";
import "server-only";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function findAll(filters: PostFilters = {}, currentUserId?: string) {
    const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const base = basePostsCte(and(...buildFilterConditions(filters)), limit);

    return selectPostDetails(base, currentUserId);
}

export type PostWithDetails = Awaited<ReturnType<typeof findAll>>[number];

export async function findById(
    postId: number,
    currentUserId?: string,
    includePending = false
): Promise<PostWithDetails | null> {
    const where = and(
        eq(posts.postId, postId),
        includePending ? undefined : eq(posts.pending, false)
    );

    const [post] = await selectPostDetails(basePostsCte(where, 1), currentUserId);
    return post ?? null;
}
