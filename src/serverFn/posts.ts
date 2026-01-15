import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as postRepository from "~/repositories/postRepository"
import { sanitizeText } from "~/utils/sanitizeText";
import { getCurrentUser } from "./auth";
import { AppError } from "~/utils/AppError";

export const createPostFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        title: z.string().min(3).max(30),
        text: z.string().max(255),
        media: z.array(z.object({
            key: z.string(),
            contentType: z.string()
        })),
        tags: z.string().toLowerCase().array(),
        gameId: z.number().optional()
    }))
    .handler(async ({ data, context: { user } }) => {
        if (data.text.length + data.media.length === 0) throw new AppError("Empty post", 404)
        const text = await sanitizeText(data.text)    
        const post = await postRepository.createPost({ ...data, userId: user.id, text })
        return {...post, user}
    })

export const getPostFn = createServerFn()
    .inputValidator((postId: number) => {
        if (postId < 1) throw notFound()
        return postId
    })
    .handler(async ({data}) => {
        const user = await getCurrentUser()
        const post = await postRepository.findById(data, user?.id)
        if (!post) throw notFound()
        return post
    })

export const getPostsFn = createServerFn()
    .inputValidator(z.object({
        username: z.string(),
        authorId: z.string(),
        likerUsername: z.string(),
        dislikerUsername: z.string(),
        tag: z.string(),
        limit: z.number(),
        cursor: z.number()
    }).partial().optional())
    .handler(async ({data}) => {
        const user = await getCurrentUser()
        return postRepository.findAll(data, user?.id)
    }) 

export const reactToPostFn = createServerFn({method: "POST"}) 
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        postId: z.number(),
        reaction: z.enum(["like", "dislike"])
    }))
    .handler(async ({data, context}) => {
        postRepository.reactToPost(data.postId, context.user.id, data.reaction)
    })

export const deletePostFn = createServerFn({method: "POST"})
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        postId: z.number()
    }))
    .handler(async ({data, context}) => {
        const result = await postRepository.deletePost(data.postId, context.user.id);
        if (result.length == 0) throw new AppError("Failed to delete", 400)
    })