import { createFileRoute } from '@tanstack/solid-router'
import { DevForm } from '~/features/developers/components/DevForm'

export const Route = createFileRoute('/admin/developers/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DevForm />
}
