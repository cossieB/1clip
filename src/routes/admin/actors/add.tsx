import { createFileRoute } from '@tanstack/solid-router'
import { ActorForm } from '~/features/actors/components/ActorForm'

export const Route = createFileRoute('/admin/actors/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ActorForm />
}
