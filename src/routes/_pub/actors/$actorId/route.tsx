import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_pub/actors/$actorId')({
  params: {
    parse: params => ({
      actorId: Number(params.actorId)
    })
  },
})
