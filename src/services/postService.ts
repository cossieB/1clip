'use server';

import { parseVideoUrl } from "~/components/embeds/IframeFactory";
import { authedOnly } from "~/middleware/authenticate";
import { AppError } from "~/utils/AppError";
import { rateLimiter } from "~/middleware/rateLimiter";
import { HttpStatusCode } from "~/utils/statusCodes";
import { GetPostsSchema, PostCreateSchema, ReactToPostSchema } from "~/zod/posts";
import * as postRepository from "~/repositories/postRepository"
import z from "zod";
import { getRequestEvent } from "solid-js/web";
import { notificationsService } from "~/integrations/notificationService";
import { getRequestIP } from "@solidjs/start/http";
import { redis } from "~/utils/redis";
import { notFound } from "~/utils/notFound";
import { parseZod } from "~/utils/parseZod";

export async function createPostFn(arg: z.input<typeof PostCreateSchema>) {
    const data = parseZod(PostCreateSchema, arg)
    const user = authedOnly()
    await rateLimiter("post:create", user.id, 5, 60);

    if ((data.text.length + data.media.length === 0) && !data.link)
        throw new AppError("Empty post", HttpStatusCode.BAD_REQUEST)

    if (data.media.length > 0)
        delete data.link

    if (data.link && !parseVideoUrl(new URL(data.link)))
        throw new AppError("Unsupported link", HttpStatusCode.BAD_REQUEST)
    const post = await postRepository.createPost({ ...data, userId: user.id, })
    return { ...post, user }
}

export async function getPostFn(postId: number) {
    parseZod(z.number(), postId)
    const user = getRequestEvent()?.locals.user
    const post = await postRepository.findById(postId, user?.id)
    if (!post) throw notFound()
    return post
}

export async function getPostsFn(filters: z.input<typeof GetPostsSchema>) {
    const data = parseZod(GetPostsSchema, filters)
    const user = getRequestEvent()?.locals.user
    return postRepository.findAll(data, user?.id)
}

export async function reactToPostFn(arg: z.input<typeof ReactToPostSchema>) {
    const data = parseZod(ReactToPostSchema, arg)
    const user = authedOnly()
    await rateLimiter("post:react", user.id, 10, 60)
    const res = await postRepository.reactToPost(data.postId, user.id, data.reaction)

    if (user.id != data.authorId && res.rows.at(0)?.reaction === "like") {
        void notificationsService.addNotification(data.authorId, {
            message: `${user.name} liked your post`,
            type: "LIKE",
            link: "/posts/" + data.postId,
            date: new Date().toISOString()
        })
    }
}

export async function deletePostFn(postId: number) {
    parseZod(z.number(), postId)
    const user = authedOnly()
    await rateLimiter("post:delete", user.id, 5, 60)
    const result = await postRepository.deletePost(postId, user.id);
    if (result.length == 0) throw new AppError("Failed to delete", HttpStatusCode.INTERNAL_SERVER_ERROR)
}

export async function viewPostFn(ids: number[]) {
    const data = z.number().array().parse(ids)
    if (data.length == 0) return
    const ip = getRequestIP();
    const user = getRequestEvent()?.locals.user
    if (!ip) return
    // Only count a view if user hasn't viewed the post within the past day
    const cached = await redis.mGet(data.map(postId => `view:${postId}:${ip}`))
    const postIds = data.filter((_, i) => cached[i] === null)
    await postRepository.viewPosts(postIds);
    await Promise.all(postIds.map(postId => redis.setEx(`view:${postId}:${ip}`, 86400, user?.id ?? "Anon")))
}

export async function searchPostsFn(str: string) {
    return await postRepository.searchPosts(z.coerce.string().parse(str))
}
