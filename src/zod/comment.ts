import z from "zod";

export const CommentCreateSchema = z.object({
    text: z.string().trim(),
    originalPost: z.number(),
    replyTo: z.number().optional(),
    notifyee: z.string().optional()
})

export const GetCommentsSchema = z.object({
    postId: z.number(),
    replyTo: z.number().optional()
})

export const ReactToCommentSchema = z.object({
    commentId: z.number(),
    reaction: z.enum(["like", "dislike"])
})