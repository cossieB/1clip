import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import * as postRepository from "~/features/posts/postRepository"
import { getCurrentUser } from "../../serverFn/auth";
import { AppError } from "~/utils/AppError.server";
import { rateLimiter } from "~/utils/rateLimiter.server";
import { HttpStatusCode } from "~/utils/statusCodes";
import { getRequestHeader } from "@tanstack/solid-start/server";
import { redis } from "~/utils/redis.server";
import { generateUniqueFilename } from "~/utils/mediaSrc";
import { storageService } from "~/integrations/storageService/index.server";
import { GetPostSchema, PostCreateSchema } from "./utils/zod";
import { orphanedFileService } from "~/services/orphanedFileService";
import { extractTokens } from "./utils/parsePost";
import { addNotification } from "../notifications/addNotification";

export const createPostFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .validator(PostCreateSchema)
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("post:create", user.id, 5, 60);

        if (data.text.length + data.media.length === 0)
            throw new AppError("Empty post", HttpStatusCode.BAD_REQUEST)

        const { hashtags, mentions } = extractTokens(data.text)

        const media = data.media.map(x => {
            const filename = generateUniqueFilename(x.filename)
            return {
                contentType: x.contentType,
                key: `media/${user.id}/${filename}`,
                contentLength: x.size,
                metadata: x.metadata
            }
        })

        const post = await postRepository.createPost({
            ...data,
            userId: user.id,
            media,
            pending: data.media.length > 0,
            tags: hashtags.map(tag => tag.toLowerCase())
        })
        const urls = await Promise.all(media.map(obj => storageService.generateSignedUrl({
            ...obj,
            metadata: {
                postid: post.postId.toString(),
                userid: user.id
            }
        })));
        await orphanedFileService.storePendingUploads(urls, user.id)
        if (mentions.length > 0)
            addNotification(
            mentions.map(username => ({ username: username.toLowerCase() })).filter(u => u.username != user.username), 
            {
                actionUrl: `/posts/${post.postId}`,
                createdAt: post.createdAt,
                type: "MENTION",
                sourceUserId: user.id,
                title: `${user.username} mentioned you`,
                message: post.text.slice(0, 20),
                entityId: post.postId,
                entityType: "post"
            })
        return { post, urls }
    })

export const markPostUploadComplete = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .validator(z.number())
    .handler(async ({ data }) => {
        const post = await postRepository.findById(data)
        if (!post) throw notFound();
        const results = await Promise.all(post.media.map(media => storageService.fileExists(media.key)));
        const allGood = results.every(r => r);
        if (allGood) {
            await postRepository.updatePost(data, {
                pending: false
            })
            post.media.forEach(m => orphanedFileService.removePendingUpload(m.key))
        }
        // TODO: add retries with bullmq
        return post
    })

export const getPostFn = createServerFn()
    .validator((postId: number) => {
        if (postId < 1) throw notFound()
        return postId
    })
    .handler(async ({ data }) => {
        const user = await getCurrentUser()
        const post = await postRepository.findById(data, user?.id)
        if (!post) throw notFound()
        return post
    })


export const getPostsFn = createServerFn()
    .validator(GetPostSchema)
    .handler(async ({ data }) => {
        const user = await getCurrentUser();
        return postRepository.findAll(data, user?.id)
    })

export const reactToPostFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .validator(z.object({
        postId: z.number(),
        reaction: z.enum(["like", "dislike"]),
        authorId: z.uuid()
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("post:react", user.id, 10, 60)
        const res = await postRepository.reactToPost(data.postId, user.id, data.reaction)

        if (user.id != data.authorId && res.rows.at(0)?.reaction === "like") {
            await addNotification([{ userId: data.authorId }], {
                actionUrl: "/posts/" + data.postId,
                type: "LIKE",
                title: "You got a like",
                message: `${user.name} liked your post`,
                entityType: "post",
                entityId: data.postId,
                sourceUserId: user.id
            })
        }
    })

export const deletePostFn = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .validator(z.object({
        postId: z.number()
    }))
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("post:delete", user.id, 5, 60)
        const result = await postRepository.deletePost(data.postId, user.id);
        if (result.length == 0) throw new AppError("Failed to delete", HttpStatusCode.INTERNAL_SERVER_ERROR)
    })

export const viewPostFn = createServerFn({ method: "POST" })
    .validator(z.array(z.number()))
    .handler(async ({ data }) => {
        if (data.length == 0) return
        const ip = getRequestHeader("cf-connecting-ip") || getRequestHeader("X-Forwarded-For")
        const user = await getCurrentUser()
        if (!ip) return
        // Only count a view if user hasn't viewed the post within the past day
        const cached = await redis.mGet(data.map(postId => `view:${postId}:${ip}`))
        const postIds = data.filter((_, i) => cached[i] === null)
        await postRepository.viewPosts(postIds);
        await Promise.all(postIds.map(postId => redis.setEx(`view:${postId}:${ip}`, 86400, user?.id ?? "Anon")))
    })

export const searchPostsFn = createServerFn()
    .validator(z.string())
    .handler(async ({ data }) => {
        return postRepository.searchPosts(data)
    })
