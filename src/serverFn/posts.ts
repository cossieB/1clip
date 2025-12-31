import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as postRepository from "~/repositories/postRepository"
import { sanitizeText } from "~/utils/sanitizeText";

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
        if (data.text.length + data.media.length === 0) throw Response.json({ error: "Empty post" }, {status: 404})
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
        return postRepository.findById(data)
    })

export const getAllPostsFn = createServerFn()
    .handler(async () => postRepository.findAll())