import z from "zod";

export const AddCommentSchema = z.object({
    text: z.string().trim().max(255).nonempty(),
    originalPost: z.number(),
    replyTo: z.number().optional(),
})

export const GetCommentsSchema = z.object({
    postId: z.number(),
    replyTo: z.number().nullable().default(null),
    cursor: z.int().optional()
})