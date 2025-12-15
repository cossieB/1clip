import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/platforms/$platformId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/platforms/$platformId"!</div>
}
