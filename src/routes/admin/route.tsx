import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router'
import { AdminLayout } from '~/components/AdminLayout/AdminLayout'
import { getCurrentUser } from '~/serverFn/auth'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user || user.role != "admin") throw redirect({to: "/"})
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
