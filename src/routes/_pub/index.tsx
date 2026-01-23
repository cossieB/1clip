import { createFileRoute, redirect } from '@tanstack/solid-router'
import { HttpStatusCode } from '~/utils/statusCodes'

export const Route = createFileRoute('/_pub/')({
  beforeLoad: async () => {
    throw redirect({to: "/posts", statusCode: HttpStatusCode.MOVED_PERMANENTLY})
  }
})