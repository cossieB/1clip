import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import * as actorRepository from "~/repositories/actorRepository"

export const getActorFn = createServerFn()
    .inputValidator((id: number) => {
        if (Number.isNaN(id) || id < 1) throw notFound()
        return id
    })
    .handler(({ data }) => {
        return actorRepository.findById(data)
    })