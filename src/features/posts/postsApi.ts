'use server'

import z from "zod";
import * as postRepository from "~/features/posts/postRepository"
import { rateLimiter } from "~/utils/rateLimiter.server";
import { generateUniqueFilename } from "~/utils/mediaSrc";
import { storageService } from "~/integrations/storageService/index.server";
import { GetPostSchema, PostCreateSchema } from "./utils/zod";
import { orphanedFileService } from "~/services/orphanedFileService";
import { extractTokens } from "./utils/parsePost";
import { addNotification } from "../notifications/addNotification";
import { getRequestEvent, respond } from "@solidjs/web";
import { getCurrentUser } from "../auth/serverFn";
import { ensureVerified } from "../auth/utils/ensureAuth";
import { redis } from "~/utils/redis";
import { zodSafeParse } from "~/utils/zodSafeParse";

export async function createPostFn(p: z.input<typeof PostCreateSchema>) {
    const data = zodSafeParse(PostCreateSchema, p)
    if (data.text.length + data.media.length === 0)
        throw respond(new Error("Empty post"), { status: 400 })

    const userSession = await ensureVerified()

    const { hashtags, mentions } = extractTokens(data.text)
    const { user } = userSession;
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
}


export async function getPostFn(postId: number) {
    const data = zodSafeParse(z.number().positive(), postId)
    const userSession = await getCurrentUser()
    const post = await postRepository.findById(data, userSession?.user.id); 
    if (!post) return respond(null, {status: 404})
    return post
}

export async function getPostsFn(filters: z.input<typeof GetPostSchema> = {}) {
    const data = zodSafeParse(GetPostSchema, filters)
    const userSession = await getCurrentUser()
    return await postRepository.findAll(data, userSession?.user.id)
}

export async function toggleLikeFn(postId: number) {
    const data = zodSafeParse(z.number().positive(), postId)
    const userSession = await ensureVerified()
    await rateLimiter("post:react", userSession.user.id, 10, 60)
    const res = await postRepository.toggleLike(data, userSession.user.id)
    if (!res) throw respond(new Error("That post might have been deleted"), { status: 404 })
    if (userSession.user.id != res.authorId && res.liked) {
        await addNotification([{ userId: res.authorId }], {
            actionUrl: "/posts/" + data,
            type: "LIKE",
            title: "You got a like",
            message: `${userSession.user.name} liked your post`,
            entityType: "post",
            entityId: data,
            sourceUserId: userSession.user.id
        })
    }
    return res
}

export async function deletePostFn(postId: number) {
    const data = zodSafeParse(z.number().positive(), postId)
    const userSession = await ensureVerified()
    await rateLimiter("post:delete", userSession.user.id, 5, 60)
    const result = await postRepository.deletePost(data, userSession.user.id);
    return result.length > 0
}

export async function viewPostFn(postId: number[]) {
    const data = zodSafeParse(z.number().array(), postId)
    if (data.length == 0) return;
    const ip = getRequestEvent()?.request.headers.get("cf-connecting-ip") || getRequestEvent()?.request.headers.get("x-forwarded-for");
    if (!ip) return;
    const userSession = await getCurrentUser()
    const cached = await redis.mGet(data.map(postId => `view:${postId}:${ip}`))
    const postIds = data.filter((_, i) => cached[i] === null)
    await postRepository.viewPosts(postIds);
    await Promise.all(postIds.map(postId => redis.setEx(`view:${postId}:${ip}`, 86400, userSession?.user.id ?? "Anon")))
}