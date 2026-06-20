'use server'

import { AppError } from "~/utils/AppError"
import { rateLimiter } from "~/middleware/rateLimiter"
import * as commentsRepository from "~/repositories/commentRepository"
import { CommentCreateSchema, GetCommentSchema, GetCommentsSchema, ReactToCommentSchema } from "~/zod/comment"
import { notificationsService } from "~/integrations/notificationService"
import z from "zod"
import { getCurrentUser } from "./authService"
import { authedOnly } from "~/middleware/authenticate"
import { HttpStatusCode } from "~/utils/statusCodes"
import { parseZod } from "~/utils/parseZod"

export async function addCommentFn(comment: z.input<typeof CommentCreateSchema>) {
    const data = parseZod(CommentCreateSchema, comment)
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
}

export async function getCommentsByPostIdFn(args: z.input<typeof GetCommentsSchema>) {
    const data = parseZod(GetCommentsSchema, args)
    const user = await getCurrentUser();
    return await commentsRepository.findCommentsByPostId(data.postId, data.replyTo, user?.id);
}

export async function reactToCommentFn(args: z.input<typeof ReactToCommentSchema>) {
    const data = parseZod(ReactToCommentSchema, args)
    const user = authedOnly()
    await rateLimiter("comment:react", user.id, 10, 60)
    await commentsRepository.reactToComment(data.commentId, user.id, data.reaction)
}

export async function deleteCommentFn(commentId: number) {
    parseZod(z.number(), commentId)
    const user = authedOnly()
    await rateLimiter("comment:delete", user.id, 5, 60)
    const result = await commentsRepository.deleteComment(commentId, user.id)
    if (result.length == 0) throw new AppError("Failed to delete", HttpStatusCode.INTERNAL_SERVER_ERROR)
}

export async function getCommentByIdFn(args: z.input<typeof GetCommentSchema>) {
    const data = parseZod(GetCommentSchema, args)
    const user = await getCurrentUser();
    const comment = await commentsRepository.getById(data.commentId, data.postId, user?.id)
    return comment ?? null
}