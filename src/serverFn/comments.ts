import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as commentsRepository from "~/repositories/commentRepository"
import { getCurrentUser } from "./auth";
import { AppError } from "~/utils/AppError";
import { rateLimiter } from "~/utils/rateLimiter";
import { HttpStatusCode } from "~/utils/statusCodes";
import { notificationsService } from "~/integrations/notificationService";

export const addCommentFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        text: z.string().trim(),
        originalPost: z.object({
            postId: z.number(),
            authorId: z.string()
        }),
        replyTo: z.object({
            commentId: z.number(),
            authorId: z.string()
        }).optional()
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("comment:create", user.id, 5, 60)

        const result = await commentsRepository.addComment({
            userId: user.id,
            postId: data.originalPost.postId,
            text: data.text,
            replyTo: data.replyTo?.commentId
        });

        const notifyee = data.replyTo ? data.replyTo.authorId : data.originalPost.authorId;
        const postId = data.replyTo ? data.replyTo.commentId : data.originalPost.postId;

        if (user.id !== notifyee)
            notificationsService.addNotification(notifyee, {
                date: new Date().toISOString(),
                message: `${user.displayUsername} has replied to you`,
                type: "REPLY",
                postId: postId.toString()
            })

        return result
    })

export const getCommentsByPostIdFn = createServerFn()
    .inputValidator(z.object({
        postId: z.number(),
        replyTo: z.number().optional()
    }))
    .handler(async ({ data }) => {
        const user = await getCurrentUser()
        const result = await commentsRepository.findCommentsByPostId(data.postId, data.replyTo, user?.id)
        return result
    })

export const reactToCommentFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        commentId: z.number(),
        reaction: z.enum(["like", "dislike"])
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("comment:react", user.id, 10, 60)
        await commentsRepository.reactToComment(data.commentId, user.id, data.reaction)
    })

export const deleteCommentFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        commentId: z.number()
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("comment:delete", user.id, 5, 60)
        const result = await commentsRepository.deleteComment(data.commentId, user.id)
        if (result.length == 0) throw new AppError("Failed to delete", HttpStatusCode.INTERNAL_SERVER_ERROR)
    })