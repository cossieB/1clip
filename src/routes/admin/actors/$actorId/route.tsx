import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/admin/actors/$actorId')({
  params: {
    parse: params => ({
      actorId: Number(params.actorId)
    })
  },
})
