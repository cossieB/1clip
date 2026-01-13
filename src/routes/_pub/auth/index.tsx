import { createFileRoute, redirect } from '@tanstack/solid-router'

export const Route = createFileRoute('/_pub/auth/')({
  beforeLoad: () => {
    throw redirect({
      to: "/auth/signin",
      replace: true
    })
  }
})
