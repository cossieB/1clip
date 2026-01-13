import { createFileRoute } from '@tanstack/solid-router'
import { GameForm } from '~/features/games/components/GameForm'

export const Route = createFileRoute('/admin/games/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GameForm />
}
