import { createFileRoute, redirect } from '@tanstack/solid-router'

export const Route = createFileRoute('/users/$username/')({
  beforeLoad: () => {
    throw redirect({
      statusCode: 308,
      from: "/users/$username/posts",
      to: "."
    })
  }
})
