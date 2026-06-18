'use server';

import { parseVideoUrl } from "~/components/embeds/IframeFactory";
import { authedOnly } from "~/middleware/authedOnly";
import { AppError } from "~/utils/AppError";
import { createServerFunction } from "~/utils/createServerFunction";
import { rateLimiter } from "~/middleware/rateLimiter";
import { HttpStatusCode } from "~/utils/statusCodes";
import { GetPostsSchema, PostCreateSchema, ReactToPostSchema } from "~/zod/posts";
import * as postRepository from "~/repositories/postRepository"
import z from "zod";
import { getRequestEvent } from "solid-js/web";
import { notificationsService } from "~/integrations/notificationService";
import { getRequestIP } from "@solidjs/start/http";
import { getCurrentUser } from "./authService";
import { redis } from "~/utils/redis";
import { notFound } from "~/utils/notFound";

export const createPostFn = createServerFunction()
    .setValidator(PostCreateSchema)
    .handler(async data => {
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
    })

export const getPostFn = createServerFunction()
    .setValidator(z.number())
    .handler(async data => {
        const user = getRequestEvent()?.locals.user
        const post = await postRepository.findById(data, user?.id)
        if (!post) throw notFound()
        return post
    })

export const getPostsFn = createServerFunction()
    .setValidator(GetPostsSchema)
    .handler(async data => {
        const user = getRequestEvent()?.locals.user
        return postRepository.findAll(data, user?.id)
    })

export const reactToPostFn = createServerFunction()
    .setValidator(ReactToPostSchema)
    .handler(async data => {
        const user = authedOnly()
        await rateLimiter("post:react", user.id, 10, 60)
        const res = await postRepository.reactToPost(data.postId, user.id, data.reaction)

        if (user.id != data.authorId && res.rows.at(0)?.reaction === "like" ) {
            void notificationsService.addNotification(data.authorId, {
                message: `${user.name} liked your post`,
                type: "LIKE",
                link: "/posts/" + data.postId,
                date: new Date().toISOString()
            })
        }        
    })    

export const deletePostFn = createServerFunction()
    .setValidator(z.number())
    .handler(async postId => {
        const user = authedOnly()
        await rateLimiter("post:delete", user.id, 5, 60)
        const result = await postRepository.deletePost(postId, user.id);
        if (result.length == 0) throw new AppError("Failed to delete", HttpStatusCode.INTERNAL_SERVER_ERROR)        
    })

export const viewPostFn = createServerFunction()
    .setValidator(z.array(z.number()))
    .handler(async data => {
        if (data.length == 0) return
        const ip = getRequestIP();
        const user = getRequestEvent()?.locals.user
        if (!ip) return
        // Only count a view if user hasn't viewed the post within the past day
        const cached = await redis.mGet(data.map(postId => `view:${postId}:${ip}`))
        const postIds = data.filter((_, i) => cached[i] === null)
        await postRepository.viewPosts(postIds);
        await Promise.all(postIds.map(postId => redis.setEx(`view:${postId}:${ip}`, 86400, user?.id ?? "Anon")))        
    })

export const searchPostsFn = createServerFunction()
    .setValidator(z.string())
    .handler(async searchStr => await postRepository.searchPosts(searchStr))