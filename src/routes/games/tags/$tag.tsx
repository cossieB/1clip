import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/games/tags/$tag')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/games/tags/$tag"!</div>
}
