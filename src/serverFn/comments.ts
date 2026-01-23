import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as commentsRepository from "~/repositories/commentRepository"
import { getCurrentUser } from "./auth";
import { AppError } from "~/utils/AppError";
import { rateLimiter } from "~/utils/rateLimiter";
import { HttpStatusCode } from "~/utils/statusCodes";

export const addCommentFn = createServerFn({method: "POST"})
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        text: z.string().trim(),
        postId: z.number(),
        replyTo: z.number().nullish()
    }))
    .handler(async ({data, context: {user}}) => {
        await rateLimiter("comment:create", user.id, 5, 60)
        try {
            return await commentsRepository.addComment({...data, userId: user.id});
        } catch (error) {
            throw new AppError("Something went wrong", HttpStatusCode.INTERNAL_SERVER_ERROR)
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
    .handler(async ({data, context: {user}}) => {
        await rateLimiter("comment:react", user.id, 10, 60)        
        await commentsRepository.reactToComment(data.commentId, user.id, data.reaction)
    })    

export const deleteCommentFn = createServerFn({method: "POST"})    
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        commentId: z.number()
    }))
    .handler(async ({data, context: {user}}) => {
        await rateLimiter("comment:delete", user.id, 5, 60)
        const result = await commentsRepository.deleteComment(data.commentId, user.id)
        if (result.length == 0) throw new AppError("Failed to delete", HttpStatusCode.INTERNAL_SERVER_ERROR)
    })