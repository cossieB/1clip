'use server'

import { AppError } from "~/utils/AppError"
import { rateLimiter } from "~/utils/rateLimiter"
import * as commentsRepository from "~/repositories/commentRepository"
import { CommentCreateSchema, GetCommentsSchema, ReactToCommentSchema } from "~/zod/comment"
import { notificationsService } from "~/integrations/notificationService"
import z from "zod"
import { createServerFunction } from "~/utils/createServerFunction"
import { getCurrentUser } from "./authService"
import { authedOnly } from "~/middleware/authedOnly"
import { HttpStatusCode } from "~/utils/statusCodes"
import { redirect } from "@solidjs/router"

export const addCommentFn = createServerFunction()
    .setValidator(CommentCreateSchema)
    .handler(async data => {
        const user = authedOnly()
        await rateLimiter("comment:create", user.id, 5, 60);
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

export const getCommentsByPostIdFn = createServerFunction()
    .setValidator(GetCommentsSchema)
    .handler(async data => {
        const user = await getCurrentUser();
        return await commentsRepository.findCommentsByPostId(data.postId, data.replyTo, user?.id);
    })

export const reactToCommentFn = createServerFunction()
    .setValidator(ReactToCommentSchema)
    .handler(async data => {
        const user = authedOnly()
        await rateLimiter("comment:react", user.id, 10, 60)
        await commentsRepository.reactToComment(data.commentId, user.id, data.reaction)
    })

export const deleteCommentFn = createServerFunction()
    .setValidator(z.number())
    .handler(async commentId => {
        const user = authedOnly()
        await rateLimiter("comment:delete", user.id, 5, 60)
        const result = await commentsRepository.deleteComment(commentId, user.id)
        if (result.length == 0) throw new AppError("Failed to delete", HttpStatusCode.INTERNAL_SERVER_ERROR)
    })

export const getCommentByIdFn = createServerFunction()
    .setValidator(z.object({
        postId: z.number(),
        commentId: z.number()
    }))
    .handler(async data => {
        const user = await getCurrentUser();
        const comment = await commentsRepository.getById(data.commentId, data.postId, user?.id)
        if (!comment) throw redirect(`/posts/${data.postId}`)
        return comment
    })