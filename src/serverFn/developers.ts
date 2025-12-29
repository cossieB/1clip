import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import * as developerRepository from "~/repositories/developerRepository"

export const getDevelopersFn = createServerFn().handler(() => developerRepository.findAll())

export const getDeveloperFn = createServerFn()
    .inputValidator((developerId: number) => {
        if (Number.isNaN(developerId) || developerId < 1) throw notFound()
        return developerId
    })
    .handler(async ({ data }) => {
        const dev = await developerRepository.findById(data)
        if (!dev) throw notFound()
        return dev
    })