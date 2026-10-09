import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as commentsRepository from "./commentRepository"
import { AppError } from "~/utils/AppError.server";
import { rateLimiter } from "~/utils/rateLimiter.server";
import { HttpStatusCode } from "~/utils/statusCodes";
import { notificationsService } from "~/integrations/notificationService";
import { redirect } from "@tanstack/solid-router";
import { getCurrentUser } from "~/serverFn/auth";
import { addNotification } from "../notifications/addNotification";

export const addCommentFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .validator(z.object({
        text: z.string().trim(),
        originalPost: z.number(),
        replyTo: z.number().optional(),
        notifyee: z.string().optional()
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("comment:create", user.id, 5, 60)

        const [result] = await commentsRepository.addComment({
            userId: user.id,
            postId: data.originalPost,
            text: data.text,
            replyTo: data.replyTo
        });

        const notifyee = data.notifyee;
        let link = `/posts/${data.originalPost}/${result.commentId}`
        
        if (notifyee && user.id !== notifyee) {
            await addNotification([{userId: notifyee,}],{                
                actionUrl: link,
                sourceUserId: user.id,
                type: "REPLY",
                title: `${user.displayUsername} replied to you`,
                message: data.text.slice(50) + (data.text.length > 50 ? "..." : ""),
                entityType: data.replyTo ? "comment" : "post",
                entityId: data.replyTo ?? data.originalPost                
            })
        }

        return result
    })

export const getCommentsByPostIdFn = createServerFn()
    .validator(z.object({
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
    .validator(z.object({
        commentId: z.number(),
        reaction: z.enum(["like", "dislike"])
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("comment:react", user.id, 10, 60)
        await commentsRepository.reactToComment(data.commentId, user.id, data.reaction)
    })

export const deleteCommentFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .validator(z.object({
        commentId: z.number()
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("comment:delete", user.id, 5, 60)
        const result = await commentsRepository.deleteComment(data.commentId, user.id)
        if (result.length == 0) throw new AppError("Failed to delete", HttpStatusCode.INTERNAL_SERVER_ERROR)
    })

export const getCommentByIdFn = createServerFn()
    .validator(z.object({
        postId: z.number(),
        commentId: z.number()
    }))
    .handler(async ({data}) => {
        const user = await getCurrentUser();
        const comment = await commentsRepository.getById(data.commentId, data.postId, user?.id)
        if (!comment) throw redirect({to: "/posts/$postId", params: {postId: data.postId}})
        return comment
    })