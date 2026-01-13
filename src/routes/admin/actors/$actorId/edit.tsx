import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { ActorForm } from '~/features/actors/components/ActorForm'
import { actorQueryOpts } from '~/features/actors/utils/actorQueryOpts'

export const Route = createFileRoute('/admin/actors/$actorId/edit')({
  component: RouteComponent,
  loader: async ({context, params}) => {
    await context.queryClient.ensureQueryData(actorQueryOpts(params.actorId))
  }
})

function RouteComponent() {
  const params = Route.useParams()
  const result = useQuery(() => actorQueryOpts(params().actorId))
  return (
    <Suspense>
      <ActorForm actor={result.data} />
    </Suspense>
  )
}
