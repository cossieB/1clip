import { notFound } from "@tanstack/solid-router"
import { createServerFn } from "@tanstack/solid-start"
import * as platformRepository from "~/repositories/platformRepository"

export const getPlatformsFn = createServerFn().handler(() => platformRepository.findAll())

export const getPlatformFn = createServerFn()
    .inputValidator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(async ({ data }) => {
        const dev = await platformRepository.findById(data)
        if (!dev) throw notFound()
        return dev
    })