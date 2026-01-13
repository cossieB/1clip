import { createFileRoute } from '@tanstack/solid-router'
import { PlatformForm } from '~/features/platforms/components/PlatformForm'

export const Route = createFileRoute('/admin/platforms/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PlatformForm />
}
