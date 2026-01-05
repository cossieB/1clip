import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as commentsRepository from "~/repositories/commentRepository"
import { getCurrentUser } from "./auth";
import { AppError } from "~/utils/AppError";

export const addCommentFn = createServerFn({method: "POST"})
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        text: z.string().trim(),
        postId: z.number(),
        replyTo: z.number().nullish()
    }))
    .handler(async ({data, context: {user}}) => {
        try {
            return await commentsRepository.addComment({...data, userId: user.id});
        } catch (error) {
            throw new AppError("Something went wrong", 500)
        }
    })

export const getCommentsByPostIdFn = createServerFn()
    .inputValidator(z.object({
        postId: z.number(),
        replyTo: z.number().optional()
    }))
    .handler(async ({data}) => {
        const user = await getCurrentUser()
        return commentsRepository.findCommentsByPostId(data.postId, data.replyTo, user?.id)
    })

export const reactToCommentFn = createServerFn({method: "POST"}) 
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        commentId: z.number(),
        reaction: z.enum(["like", "dislike"])
    }))
    .handler(async ({data, context}) => {
        commentsRepository.reactToComment(data.commentId, context.user.id, data.reaction)
    })    

export const deleteCommentFn = createServerFn({method: "POST"})    
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        commentId: z.number()
    }))
    .handler(async ({data, context}) => {
        const result = await commentsRepository.deleteComment(data.commentId, context.user.id)
        if (result.length == 0) throw new AppError("Failed to delete", 400)
    })