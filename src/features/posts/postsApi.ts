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
import { GET } from "@solidjs/web/server-functions";
import { db } from "~/drizzle/db";
import { postTags } from "~/drizzle/schema";
import { count, sql } from "drizzle-orm";

export async function createPostFn(p: z.input<typeof PostCreateSchema>) {
    'use server'

    const data = zodSafeParse(PostCreateSchema, p)
    if (data.text.length + data.media.length === 0)
        throw respond(new Error("Empty post"), { status: 400 })

    const userSession = await ensureVerified()
    await rateLimiter("post:create", userSession.user.id, 10, 60)
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


export const getPostFn = GET(async (postId: number) => {
    'use server'
    const data = zodSafeParse(z.number().positive(), postId)
    const userSession = await getCurrentUser()
    const post = await postRepository.findById(data, userSession?.user.id);
    return respond(post ?? null, {
        headers: {
            "Cache-Control": "private, max-age=600"
        }
    })
})

export const getPostsFn = GET(async (filters: z.input<typeof GetPostSchema> = {}) => {
    'use server'
    const data = zodSafeParse(GetPostSchema, filters)
    const userSession = await getCurrentUser()
    const post = await postRepository.findAll(data, userSession?.user.id)
    return respond(post, {
        headers: {
            "Cache-Control": "private, max-age=600"
        }
    })
})

export async function toggleLikeFn(postId: number) {
    'use server'
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
    'use server'
    const data = zodSafeParse(z.number().positive(), postId)
    const userSession = await ensureVerified()
    await rateLimiter("post:delete", userSession.user.id, 5, 60)
    const result = await postRepository.deletePost(data, userSession.user.id);
    return result.length > 0
}

export async function viewPostFn(postId: number[]) {
    'use server'
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

export async function markPostUploadComplete(postId: number) {
    'use server'
    const data = zodSafeParse(z.number().positive(), postId)
    const userSession = await ensureVerified()
    const post = await postRepository.findById(data, undefined, true);
    if (!post) {
        console.error(`[ERROR] markPostUploadComplete(${postId}) called but post not found`)
        throw respond(new Error("Something went wrong. Please try again later"), {
            status: 500
        });
    }

    if (!post.pending || post.author.id != userSession.user.id) throw respond(new Error("Forbidden"), {
        status: 403
    })

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
}

export const getTrendingFn = GET(async() => {
    'use server'
    const result = await db
        .select({
            count: count().as("count"),
            hash: postTags.tagName
        })
        .from(postTags)
        .groupBy(postTags.tagName)
        .orderBy(sql`count DESC`)
        .limit(5)

    return respond(result.map(x => x.hash), {
        headers: {
            "Cache-Control": "public, max-age=86400"
        }
    })
})