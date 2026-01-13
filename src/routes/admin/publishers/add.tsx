import { createFileRoute } from '@tanstack/solid-router'
import { PubForm } from '~/features/publishers/components/PubForm'

export const Route = createFileRoute('/admin/publishers/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PubForm />
}
