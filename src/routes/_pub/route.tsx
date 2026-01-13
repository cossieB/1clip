import { createFileRoute, Outlet } from '@tanstack/solid-router'
import { MainLayout } from '~/components/MainLayout/MainLayout'

export const Route = createFileRoute('/_pub')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
