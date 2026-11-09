import { zodSafeParse } from "~/utils/zodSafeParse";
import { AddCommentSchema, GetCommentsSchema } from "../utils/zod";
import z from "zod";
import { rateLimiter } from "~/utils/rateLimiter.server";
import * as commentsRepository from "./commentRepository"
import { ensureVerified } from "~/features/auth/utils/ensureAuth";
import { addNotification } from "~/features/notifications/addNotification";
import { getCurrentUser } from "~/features/auth/serverFn";
import { getRequestEvent, respond } from "@solidjs/web";
import { HttpStatusCode } from "~/utils/statusCodes";
import { GET } from "@solidjs/web/server-functions";

export async function addCommentFn(input: z.input<typeof AddCommentSchema>) {
    'use server'
    const data = zodSafeParse(AddCommentSchema, input);
    const userSession = await ensureVerified()
    await rateLimiter("comment:create", userSession.user.id, 5, 60)
    const { recipientUserId, ...result } = await commentsRepository.addComment({
        userId: userSession.user.id,
        postId: data.originalPost,
        text: data.text,
        replyTo: data.replyTo
    });

    let link = `/posts/${data.originalPost}/${result.commentId}`

    if (userSession.user.id !== recipientUserId) {
        await addNotification([{ userId: recipientUserId, }], {
            actionUrl: link,
            sourceUserId: userSession.user.id,
            type: "REPLY",
            title: `${userSession.user.displayUsername} replied to you`,
            message: data.text.slice(50) + (data.text.length > 50 ? "..." : ""),
            entityType: data.replyTo ? "comment" : "post",
            entityId: data.replyTo ?? data.originalPost
        })
    }
    return result
}

export const getCommentsByPostIdFn =  GET(async (input: z.input<typeof GetCommentsSchema>) => {
    'use server'
    const data = GetCommentsSchema.parse(input);
    const userSession = await getCurrentUser()
    const comments = await commentsRepository.findPostComments(data.postId, data.replyTo, userSession?.user.id)
    return respond(comments, {
        headers: {
            "Cache-Control": "private, max-age=600"
        }
    })
})

export async function toggleCommentLikeFn(commentId: number) {
    'use server'
    const data = zodSafeParse(z.number(), commentId)
    const userSession = await ensureVerified()
    await rateLimiter("comment:react", userSession.user.id, 10, 60)    
    return await commentsRepository.toggleLike(data, userSession.user.id)
}

export async function deleteCommentFn(commentId: number) {
    'use server'
    const data = zodSafeParse(z.number(), commentId)
    const userSession = await ensureVerified()    
    await rateLimiter("comment:delete", userSession.user.id, 5, 60)
    const result = await commentsRepository.deleteComment(data, userSession.user.id)
    if (result.length == 0) throw respond(new Error("Failed to delete"), {status: HttpStatusCode.INTERNAL_SERVER_ERROR})
}