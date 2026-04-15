import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as commentsRepository from "~/repositories/commentRepository"
import { getCurrentUser } from "./auth";
import { AppError } from "~/utils/AppError";
import { rateLimiter } from "~/utils/rateLimiter";
import { HttpStatusCode } from "~/utils/statusCodes";
import { notificationsService } from "~/integrations/notificationService";
import { redirect } from "@tanstack/solid-router";

export const addCommentFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        text: z.string().trim(),
        originalPost: z.number(),
        replyTo: z.number().optional(),
        notifyee: z.string().optional()
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("comment:create", user.id, 5, 60)

        const result = await commentsRepository.addComment({
            userId: user.id,
            postId: data.originalPost,
            text: data.text,
            replyTo: data.replyTo
        });

        const notifyee = data.notifyee;
        let link = `/posts/${data.originalPost}/${result.at(0)?.commentId}`
        
        if (notifyee && user.id !== notifyee)
            notificationsService.addNotification(notifyee, {
                date: new Date().toISOString(),
                message: `${user.displayUsername} has replied to you`,
                type: "REPLY",
                link
            })

        return result
    })

export const getCommentsByPostIdFn = createServerFn()
    .inputValidator(z.object({
        postId: z.number(),
        replyTo: z.number().optional()
    }))
    .handler(async ({ data }) => {
        const user = await getCurrentUser();
        const result = await commentsRepository.findCommentsByPostId(data.postId, data.replyTo, user?.id);
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

export const getCommentByIdFn = createServerFn()
    .inputValidator(z.object({
        postId: z.number(),
        commentId: z.number()
    }))
    .handler(async ({data}) => {
        const user = await getCurrentUser();
        const comment = await commentsRepository.getById(data.commentId, data.postId, user?.id)
        if (!comment) throw redirect({to: "/posts/$postId", params: {postId: data.postId}})
        return comment
    })