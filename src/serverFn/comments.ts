import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as commentsRepository from "~/repositories/commentRepository"
import { getCurrentUser } from "./auth";

export const addComment = createServerFn({method: "POST"})
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        text: z.string().trim(),
        postId: z.number(),
        replyTo: z.number().nullish()
    }))
    .handler(async ({data, context: {user}}) => {
        const p = await commentsRepository.addComment({...data, userId: user.id})
    })

export const getCommentsByPostId = createServerFn()
    .inputValidator(z.object({
        postId: z.number(),
        replyTo: z.number().optional()
    }))
    .handler(async ({data}) => {
        const user = await getCurrentUser()
        return commentsRepository.findCommentsByPostId(data.postId, data.replyTo, user?.id)
    })

export const reactToComment = createServerFn({method: "POST"}) 
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        commentId: z.number(),
        reaction: z.enum(["like", "dislike"])
    }))
    .handler(async ({data, context}) => {
        commentsRepository.reactToComment(data.commentId, context.user.id, data.reaction)
    })    