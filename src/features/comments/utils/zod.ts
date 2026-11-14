import z from "zod";

export const AddCommentSchema = z.object({
    text: z.string().trim().max(255).nonempty(),
    originalPost: z.int(),
    replyTo: z.int().optional(),
})

export const GetCommentsSchema = z.object({
    postId: z.int(),
    replyTo: z.int().nullable().default(null),
    cursor: z.int().optional()
})