import z from "zod";
import { variables } from "~/utils/variables";

export const PostCreateSchema = z.object({
    title: z.string().min(3).max(30),
    text: z.string().max(variables.POST_LIMIT),
    media: z.array(z.object({
        size: z.number().lte(8 * 1024 * 1024),
        contentType: z.string().refine(str => /^(image|video|audio)/.test(str)),
        filename: z.string(),
        metadata: z.record(z.string(), z.string()).optional()
    })),
    tags: z.string().toLowerCase().array(),
    gameId: z.number().optional(),
    link: z.url().optional().catch(undefined)
});

export const GetPostSchema = z.object({
    username: z.string(),
    authorId: z.string(),
    likerUsername: z.string(),
    dislikerUsername: z.string(),
    tag: z.string(),
    limit: z.number(),
    cursor: z.number(),
    followerId: z.uuidv7(),
    gameId: z.number()
}).partial().optional();
