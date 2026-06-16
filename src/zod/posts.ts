import z from "zod";
import { variables } from "~/utils/variables";

export const PostCreateSchema = z.object({
    title: z.string().min(3).max(30),
    text: z.string().max(variables.POST_LIMIT),
    media: z.array(z.object({
        key: z.string(),
        contentType: z.string()
    })),
    tags: z.string().toLowerCase().array(),
    gameId: z.number().optional(),
    link: z.url().optional().catch(undefined)
})

export const GetPostsSchema = z.object({
    username: z.string(),
    authorId: z.string(),
    likerUsername: z.string(),
    dislikerUsername: z.string(),
    tag: z.string(),
    limit: z.number(),
    cursor: z.number(),
    followerId: z.uuidv7(),
    gameId: z.number()
}).partial().optional()    

export const ReactToPostSchema = z.object({
        postId: z.number(),
        reaction: z.enum(["like", "dislike"]),
        authorId: z.uuid()
    })