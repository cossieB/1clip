import z from "zod";

export const AddCommentSchema = z.object({
        text: z.string().trim().length(255),
        originalPost: z.number(),
        replyTo: z.number().optional(),
    })

export const GetCommentsSchema = z.object({
    postId: z.number(),
    replyTo: z.number().nullable().default(null)
})