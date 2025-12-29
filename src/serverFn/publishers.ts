import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import * as publisherRepository from "~/repositories/publisherRepository"

export const getPublishersFn = createServerFn().handler(() => publisherRepository.findAll())

export const getPublisherFn = createServerFn()
    .inputValidator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(async ({ data }) => {
        const dev = await publisherRepository.findById(data)
        if (!dev) throw notFound()
        return dev
    })