import { env } from "virtual:solid-env/client";
import z from "zod";

export const PostCreateSchema = z.object({
    title: z.string().min(3).max(30),
    text: z.string().max(env.VITE_POST_LIMIT),
    media: z.array(z.object({
        size: z.int().lte(8 * 1024 * 1024),
        contentType: z.string().refine(str => /^(image|video|audio)/.test(str)),
        filename: z.string(),
        metadata: z.record(z.string(), z.string()).optional()
    })).default([]),
    gameId: z.int().optional(),
});

export const GetPostSchema = z.object({
    username: z.string(),
    authorId: z.string(),
    likerUsername: z.string(),
    dislikerUsername: z.string(),
    tag: z.string(),
    limit: z.int(),
    cursor: z.int(),
    followerId: z.uuidv7(),
    gameId: z.int(),
    includePending: z.boolean().default(false),
    searchString: z.string().optional()
}).partial().optional();

export type PostFilters = z.input<typeof GetPostSchema>